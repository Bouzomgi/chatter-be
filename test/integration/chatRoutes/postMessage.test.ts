// CASES
// should successfully create post in a new conversation and thread if there is no existing thread
// should create post in existing conversation if there is an existing thread
// should fail if a member does not exist
// should fail if user is not part of the request's members
// should fail if the request is invalid

import request from 'supertest'
import server from '../../../src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'
import { ExtractPathRequestBody } from '../../../openapi/typeExtractors'
import prisma from '../../../src/database'

describe('Chat User Details', () => {
  it('should successfully create post in a new conversation and thread if there is no existing thread', async () => {
    expect(await doesConversationExist([2, 3])).toBe(false)

    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [2, 3],
      content: 'message in a new thread'
    }

    const senderUserId = 2
    const authToken = generateAuthToken(senderUserId)
    const res = await request(server)
      .post('/api/authed/message')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(messageBody)

    expect(res.status).toBe(StatusCodes.CREATED)

    expect(await doesConversationExist([2, 3])).toBe(true)
    const createdConversationId = await getConversation([2, 3])
    const createdThreads = await getThreads(createdConversationId)
    expect(createdThreads).toHaveLength(2)

    // FOLLOWING BEHAVIOR IS SPECIFIC TO NEW CONVERSATIONS
    // check that thread of the sender does not include an unseen message
    const senderThread = createdThreads.find(
      (threadId) => threadId.memberId == senderUserId
    )
    expect(senderThread).toBeDefined()
    expect(senderThread!.unseenMessageId).toBeNull()

    // check that thread of the sendee includes an unseen message
    const sendeeThread = createdThreads.find(
      (threadId) => threadId.memberId != senderUserId
    )
    expect(sendeeThread).toBeDefined()
    const createdMessageId = res.body.message.messageId
    expect(sendeeThread!.unseenMessageId).toBe(createdMessageId)
  })

  it('should successfully create post in an existing thread', async () => {
    expect(await doesConversationExist([1, 2])).toBe(true)

    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [1, 2],
      content: 'message in an existing thread'
    }

    const senderUserId = 1
    const authToken = generateAuthToken(senderUserId)
    const res = await request(server)
      .post('/api/authed/message')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(messageBody)

    expect(res.status).toBe(StatusCodes.CREATED)

    expect(await doesConversationExist([1, 2])).toBe(true)
    const createdConversationId = await getConversation([1, 2])
    const createdThreads = await getThreads(createdConversationId)
    expect(createdThreads).toHaveLength(2)

    // check that thread of the sendee includes an unseen message
    const sendeeThread = createdThreads.find(
      (threadId) => threadId.memberId != senderUserId
    )
    expect(sendeeThread).toBeDefined()
    const createdMessageId = res.body.message.messageId
    expect(sendeeThread!.unseenMessageId).toBe(createdMessageId)
  })

  it('should fail if a member does not exist', async () => {
    expect(await doesMemberExist(100)).toBe(false)

    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [1, 100],
      content: 'test message'
    }
    const authToken = generateAuthToken(1)
    const res = await request(server)
      .post('/api/authed/message')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(messageBody)

    expect(res.status).toBe(StatusCodes.BAD_REQUEST)
  })

  it("should fail if requesting user is not part of the request's member list", async () => {
    expect(await doesConversationExist([1, 2])).toBe(true)

    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [1, 2],
      content: 'test message'
    }
    const authToken = generateAuthToken(3)
    const res = await request(server)
      .post('/api/authed/message')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(messageBody)

    expect(res.status).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/api/authed/chatUsersDetails').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

const doesMemberExist = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return user != null
}

// Checks if a conversation exists between a group of userIds
const getConversation = async (userIds: number[]) => {
  const conversationObject = await prisma.$queryRaw<
    { conversationId: number }[]
  >`
    SELECT t1."conversationId"
    FROM "Thread" AS t1
    WHERE t1."memberId" = ANY(${userIds})
    GROUP BY t1."conversationId"
    HAVING COUNT(DISTINCT t1."memberId") = ${userIds.length}
      AND NOT EXISTS (
        SELECT 1
        FROM "Thread" AS t2
        WHERE t2."conversationId" = t1."conversationId"
          AND t2."memberId" <> ALL(${userIds})
      );
  `

  if (conversationObject.length === 0) {
    throw new Error('Conversation does not exist')
  }

  return conversationObject[0].conversationId
}

const doesConversationExist = async (userIds: number[]) => {
  try {
    await getConversation(userIds)
    return true
  } catch {
    return false
  }
}

const getThreads = (conversationId: number) =>
  prisma.thread.findMany({
    where: { conversationId }
  })

import request from 'supertest'
import server from '@src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '@src/utils/generateAuthToken'
import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import {
  doesConversationExist,
  getConversation
} from '@test/testHelpers/checkDatabase/conversationChecks'
import { doesUserExist } from '@test/testHelpers/checkDatabase/userChecks'
import { getThreads } from '@test/testHelpers/checkDatabase/threadQueries'

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
    expect(await doesUserExist(100)).toBe(false)

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

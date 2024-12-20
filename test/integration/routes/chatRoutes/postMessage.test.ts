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
import { setupWebSocketServer } from '@src/websocket/messageSocket'
import env from '@src/config'
import WebSocket from 'ws'

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

  /*
    WEBSOCKET
    Test idea: Send a message from user 1 to user 2. User 2 should receive the message via WebSocket.
  */
  it('should correctly send a message to WebSocket server', (done) => {
    const wss = setupWebSocketServer(server)
    server.listen(env.PORT)

    // eslint-disable-next-line prefer-const
    let timeoutHandle: NodeJS.Timeout
    let complete = false

    const user2AuthToken = generateAuthToken(2)
    const ws = new WebSocket(`ws://localhost:${env.PORT}/`, {
      headers: {
        Cookie: `auth-token=${user2AuthToken}`
      }
    })

    const messageContent = 'my websocket message'
    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [1, 2],
      content: messageContent
    }

    // Complete the test safely
    const finishTest = (error?: Error) => {
      if (!complete) {
        complete = true

        if (timeoutHandle) {
          clearTimeout(timeoutHandle)
        }

        ws.close()
        wss.close()
        server.close()
        done(error)
      }
    }

    // When websocket has connected, send a message
    const user1AuthToken = generateAuthToken(1)
    wss.on('connection', () => {
      request(server)
        .post('/api/authed/message')
        .set('Cookie', [`auth-token=${user1AuthToken}`])
        .send(messageBody)
        .end((err, res) => {
          if (err || res.status !== 201) {
            finishTest(
              new Error(
                `POST request failed with status: ${res.status}. Error: ${err?.message}`
              )
            )
          }
        })
    })

    ws.on('message', (message) => {
      const messageJson = JSON.parse(message.toString())
      expect(messageJson).toHaveProperty('message')
      expect(messageJson.message).toHaveProperty('content', messageContent)
      finishTest()
    })

    ws.on('error', (err) => {
      finishTest(new Error(`WebSocket error: ${err}`))
    })

    ws.on('close', () => {
      finishTest(new Error('WebSocket connection closed unexpectedly.'))
    })

    // Timeout to prevent hanging tests
    const testTimeout = 3000
    timeoutHandle = setTimeout(() => {
      if (!complete) {
        finishTest(new Error(`Test timed out after ${testTimeout} ms.`))
      }
    }, testTimeout)
  })
})

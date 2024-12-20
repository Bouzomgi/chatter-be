import { Server } from 'http'
import WebSocket from 'ws'
import { setupWebSocketServer, notifyUser } from '@src/websockets/messageSocket'
import express from 'express'
import generateAuthToken from '@src/utils/generateAuthToken'
import MessageNotificationPayload from '@src/websockets/MessageNotificationPayload'

const testPort = 4001
const app = express()
let server: Server
let wss: WebSocket.Server

beforeEach(() => {
  server = app.listen(testPort)
  wss = setupWebSocketServer(server)
})

afterEach(() => {
  wss.close()
  server.close()
})

const createWebSocket = (token: string) =>
  new WebSocket(`ws://localhost:${testPort}/`, {
    headers: {
      Cookie: `auth-token=${token}`
    }
  })

describe('WebSocket Server', () => {
  it('should successfully connect an authorized client', (done) => {
    const jwtToken = generateAuthToken(1)
    const ws = createWebSocket(jwtToken)
    let complete = false

    ws.on('open', () => {
      if (!complete) {
        complete = true
        done()
        ws.close()
      }
    })

    ws.on('error', (err) => {
      if (!complete) {
        complete = true
        done(err)
      }
    })

    ws.on('close', () => {
      if (!complete) {
        complete = true
        done(new Error('WebSocket connection closed unexpectedly'))
      }
    })
  })

  it('should correctly notify users when a message is sent', (done) => {
    let complete = false
    const notificationPayload: MessageNotificationPayload = {
      conversationId: 1,
      threadId: 2,
      members: [1, 2],
      message: {
        messageId: 1,
        fromUserId: 1,
        createdAt: '2024-03-15T10:25:00Z',
        content: 'New message'
      }
    }

    const jwtToken = generateAuthToken(1)
    const ws = createWebSocket(jwtToken)

    ws.on('open', () => notifyUser(1, notificationPayload))

    ws.on('message', (message) => {
      if (!complete) {
        complete = true
        const parsedMessage = JSON.parse(message.toString())
        expect(parsedMessage).toEqual(notificationPayload)
        done()
        ws.close()
      }
    })

    ws.on('error', (err) => {
      if (!complete) {
        complete = true
        done(err)
      }
    })

    ws.on('close', () => {
      if (!complete) {
        complete = true
        done(new Error('WebSocket connection closed unexpectedly'))
      }
    })
  })

  it('should correctly notify users when a message is sent when there are multiple connections', (done) => {
    let completeCount = 0
    const notificationPayload: MessageNotificationPayload = {
      conversationId: 1,
      threadId: 2,
      members: [1, 2],
      message: {
        messageId: 1,
        fromUserId: 1,
        createdAt: '2024-03-15T10:25:00Z',
        content: 'New message'
      }
    }

    const user1JwtToken = generateAuthToken(1)
    const user2JwtToken = generateAuthToken(2)

    // WebSocket clients
    const user1ws1 = createWebSocket(user1JwtToken)
    const user1ws2 = createWebSocket(user1JwtToken)
    const user2ws = createWebSocket(user2JwtToken)

    const user1Sockets = [user1ws1, user1ws2]
    const allSockets = [...user1Sockets, user2ws]
    let receivedMessagesCount = 0

    // Trigger notification after establishing connections
    setTimeout(() => {
      notifyUser(1, notificationPayload)
    }, 500)

    // Function to clean up and close all WebSocket connections
    const cleanup = (errorMessage?: string) => {
      if (completeCount == 0) {
        ++completeCount
        if (errorMessage) done(new Error(errorMessage))
        else done()
        allSockets.forEach((socket) => socket.close())
      }
    }

    // Verify that all connections for user1 receive the message
    user1Sockets.forEach((ws) => {
      ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message.toString())
        expect(parsedMessage).toEqual(notificationPayload)
        receivedMessagesCount++

        // Once all user1 sockets have received the message, close all and call done()
        if (receivedMessagesCount === user1Sockets.length) {
          cleanup() // Close all sockets and finish test
        }
      })

      ws.on('error', (err) => {
        cleanup(`Error received from WebSocket: ${err.message}`)
      })

      ws.on('close', () => {
        cleanup('WebSocket connection closed unexpectedly for user1')
      })
    })

    // Check that user2 does not receive the message
    user2ws.on('message', () => {
      cleanup('User2 should not receive the message')
    })

    user2ws.on('error', (err) => {
      cleanup(`Error received from user2 WebSocket: ${err.message}`)
    })

    user2ws.on('close', () => {
      cleanup('User2 WebSocket closed unexpectedly')
    })
  })

  it('should fail to connect when an invalid token is given', (done) => {
    let complete = false
    const ws = createWebSocket('fake-token')

    ws.on('open', () => {
      if (!complete) {
        complete = true
        done(new Error('should not connect'))
        ws.close()
      }
    })

    ws.on('error', (err) => {
      if (!complete) {
        complete = true
        expect(err).toBeTruthy()
        done()
      }
    })
  })
})

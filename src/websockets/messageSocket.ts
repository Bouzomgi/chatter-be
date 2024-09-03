import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import verifyTokenWebSocket from './validate'
import MessageNotificationPayload from './MessageNotificationPayload'

interface UserSocket extends WebSocket {
  userId: number
}

const onSocketError = (err: Error) => {
  console.error(err)
}

const userIdToSocketMap = new Map<number, Set<WebSocket>>()

const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    socket.on('error', onSocketError)

    // Validate the token during the handshake
    const userId = await verifyTokenWebSocket(request)
    if (!userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return
    }

    // Proceed with WebSocket connection
    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      ;(ws as UserSocket).userId = userId
      wss.emit('connection', ws, request)
    })
  })

  wss.on('connection', (ws: UserSocket) => {
    console.log('Client has been added')
    const existingSocketSet = userIdToSocketMap.get(ws.userId)

    if (existingSocketSet != undefined) {
      existingSocketSet.add(ws)
    } else {
      userIdToSocketMap.set(ws.userId, new Set([ws as WebSocket]))
    }

    ws.on('close', () => {
      userIdToSocketMap.get(ws.userId)?.delete(ws)
    })
  })

  return wss
}

const notifyUsers = (
  userIds: number[],
  notificationPayload: MessageNotificationPayload
) => {
  const clients: WebSocket[] = userIds.flatMap((userId) => {
    const socketMap = userIdToSocketMap.get(userId)
    return socketMap != undefined ? Array.from(socketMap) : []
  })

  for (const client of clients) {
    const jsonString = JSON.stringify(notificationPayload)
    const buffer = Buffer.from(jsonString, 'utf-8')
    client.send(buffer)
  }
}

export { setupWebSocket, notifyUsers }

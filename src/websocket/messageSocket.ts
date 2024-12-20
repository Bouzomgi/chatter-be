import { WebSocketServer, WebSocket } from 'ws'
import { Server } from 'http'
import verifyTokenWebSocket from './validate'
import MessageNotificationPayload from './MessageNotificationPayload'

interface UserSocket extends WebSocket {
  userId: number
}

const userIdToSocketMap = new Map<number, Set<WebSocket>>()

const setupWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    console.debug('Upgrading connection to WebSocket')
    socket.on('error', (err) => console.error(err))

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
      console.debug('Websocket connection established')
    })
  })

  wss.on('connection', (ws: UserSocket) => {
    console.debug('Client has been added')
    const existingSocketSet = userIdToSocketMap.get(ws.userId)

    if (existingSocketSet != undefined) {
      existingSocketSet.add(ws)
    } else {
      userIdToSocketMap.set(ws.userId, new Set([ws as WebSocket]))
    }

    ws.on('close', () => {
      userIdToSocketMap.get(ws.userId)?.delete(ws)
    })

    ws.on('error', (err) => console.error(err))
  })

  return wss
}

const notifyUser = (
  userId: number,
  notificationPayload: MessageNotificationPayload
) => {
  console.debug('Notifying user', userId)
  const socketMap = userIdToSocketMap.get(userId)
  const clients: WebSocket[] =
    socketMap != undefined ? Array.from(socketMap) : []

  for (const client of clients) {
    const jsonString = JSON.stringify(notificationPayload)
    const buffer = Buffer.from(jsonString)
    const text = buffer.toString('utf-8')
    client.send(text)
    console.debug("Sent message to user's client")
  }
}

export { setupWebSocketServer, notifyUser }

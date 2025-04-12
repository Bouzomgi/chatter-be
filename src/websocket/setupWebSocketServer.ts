import { Server } from 'http'
import { WebSocket, WebSocketServer } from 'ws'
import userIdToSocketMap from './userIdToSocketMap'
import verifyTokenWebSocket from './validate'

interface UserSocket extends WebSocket {
  userId: number
}

const setupWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (request, socket, head) => {
    console.debug('Upgrading connection to WebSocket')
    if (request.url !== '/authed') {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n')
      socket.destroy()
      return
    }
    socket.on('error', (err) => console.error(err))
    // Validate the token during the handshake
    const userId = await verifyTokenWebSocket(request)
    if (!userId) {
      console.debug('Unauthorized connection attempt')
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
    console.debug(`WS client ${ws.userId} has been added`)
    const existingSocketSet = userIdToSocketMap.get(ws.userId)
    if (existingSocketSet != undefined) {
      existingSocketSet.add(ws)
    } else {
      userIdToSocketMap.set(ws.userId, new Set([ws as WebSocket]))
    }
    ws.on('close', () => {
      console.debug(`Closing ws connection from ${ws.userId}`)
      userIdToSocketMap.get(ws.userId)?.delete(ws)
    })
    ws.on('error', (err) => console.error(err))
  })

  return wss
}

export default setupWebSocketServer

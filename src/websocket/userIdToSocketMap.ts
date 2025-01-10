import { WebSocket } from 'ws'

const userIdToSocketMap = new Map<number, Set<WebSocket>>()

export default userIdToSocketMap

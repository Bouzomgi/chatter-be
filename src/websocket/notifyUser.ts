import WebSocket from 'ws'
import MessageNotificationPayload from './MessageNotificationPayload'
import userIdToSocketMap from './userIdToSocketMap'

const notifyUser = (
  userId: number,
  notificationPayload: MessageNotificationPayload
) => {
  console.debug('Notifying user', userId)
  const socketMap = userIdToSocketMap.get(userId)
  const clients: WebSocket[] =
    socketMap != undefined ? Array.from(socketMap) : []
  if (clients.length == 0) {
    console.debug("User wasn't found online to notify")
  }
  for (const client of clients) {
    const jsonString = JSON.stringify(notificationPayload)
    const buffer = Buffer.from(jsonString)
    const text = buffer.toString('utf-8')
    client.send(text)
    console.debug("Sent message to user's client")
  }
}

export default notifyUser

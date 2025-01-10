import userIdToSocketMap from './userIdToSocketMap'

const disconnectUser = (userId: number) => {
  userIdToSocketMap.get(userId)?.forEach((socket) => {
    console.debug('Logout -- closing socket for user', userId)
    socket.close()
  })
}

export default disconnectUser

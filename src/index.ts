import server from './app'
import env from './config'
import { setupWebSocket } from './websockets/messageSocket'

setupWebSocket(server)

// RUN THE SERVER
server.listen(env.PORT, () => {
  console.info(`App listening on port ${env.PORT}`)
})

export default server

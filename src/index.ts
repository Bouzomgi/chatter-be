import 'module-alias/register'
import server from './app'
import env from './config'
import setupWebSocketServer from './websocket/setupWebSocketServer' // CANNOT use import alias

setupWebSocketServer(server)

// RUN THE SERVER
server.listen(env.PORT, () => {
  console.info(`App listening on port ${env.PORT}`)
})

export default server

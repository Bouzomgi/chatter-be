import app from '../../src/app'
import env from '../../src/config'

const server = app.listen(env.PORT, () =>
  console.log(`Listening on port ${env.PORT}`)
)

// Export a function to close the server after all tests
export default async () => {
  if (server) {
    await server.close()
  }
}

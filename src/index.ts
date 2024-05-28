import app from './app'
import env from './config'
import swaggerDocs from './api/api-doc'

// RUN THE SERVER
app.listen(env.PORT, () => {
  console.log(`App listening on port ${env.PORT}`)

  // Spins up OpenAPI docs route
  swaggerDocs(app, '/docs')
  console.info('Docs available at /docs')
})

export default app

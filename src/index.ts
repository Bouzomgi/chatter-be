import app from './app'
import env from './config'

// RUN THE SERVER
app.listen(env.PORT, () => {
  console.log(`App listening on port ${env.PORT}`)
})

export default app

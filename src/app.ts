import express from 'express'
import { verifyToken } from './middlewares/verifyToken'
import authRoutes from './routes/authRoutes'
import settingsRoutes from './routes/settingsRoutes'
import chatRoutes from './routes/chatRoutes'

const app = express()

// MIDDLEWARES
app.use(express.json())
app.use('/', authRoutes)

app.use('/authed', verifyToken, settingsRoutes)
app.use('/authed', verifyToken, chatRoutes)

// ROUTES
app.get('/', (req, res) => {
  res.send('Hello World!')
})

export default app

import express from 'express'
import { verifyToken } from './middlewares/tokenVerification'
import authRoutes from './routes/authRoutes'
import settingsRoutes from './routes/settingsRoutes'
import chatRoutes from './routes/chatRoutes'
import { StatusCodes } from 'http-status-codes'
import cors from 'cors'

const app = express()

// MIDDLEWARES
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

app.use('/', authRoutes)

app.use('/authed', verifyToken, settingsRoutes)
app.use('/authed', verifyToken, chatRoutes)

// ROUTES
app.get('/health', (_, res) => {
  res.status(StatusCodes.OK).json({ error: 'Up and running!' })
})

export default app

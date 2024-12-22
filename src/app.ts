import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { StatusCodes } from 'http-status-codes'
import swaggerDocs from './api/api-doc'
import { verifyToken } from './middlewares/tokenVerification'
import authRoutes from './routes/authRoutes'
import chatRoutes from './routes/chatRoutes'
import settingsRoutes from './routes/settingsRoutes'

const app = express()

// MIDDLEWARES
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api', authRoutes)

app.use('/api/authed', verifyToken, [settingsRoutes, chatRoutes])

swaggerDocs(app, 'api/docs')

// ROUTES
app.get('/api/health', (_, res) => {
  res.status(StatusCodes.OK).send('Up and running!')
})

const server = http.createServer(app)

export default server

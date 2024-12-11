import express from 'express'
import { verifyToken } from './middlewares/tokenVerification'
import authRoutes from './routes/authRoutes'
import settingsRoutes from './routes/settingsRoutes'
import chatRoutes from './routes/chatRoutes'
import { StatusCodes } from 'http-status-codes'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import swaggerDocs from './api/api-doc'

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

import cookieParser from 'cookie-parser'
import cors from 'cors'
import http from 'http'
import { StatusCodes } from 'http-status-codes'
import swaggerDocs from './api/api-doc'
import env from './config'
import { verifyToken } from './middlewares/tokenVerification'
import authRoutes from './routes/authRoutes'
import chatRoutes from './routes/chatRoutes'
import settingsRoutes from './routes/settingsRoutes'
import express, { Request, Response, NextFunction } from 'express'

const app = express()

// MIDDLEWARES
app.use((req: Request, res: Response, next: NextFunction) => {
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  console.log(`Incoming Request: ${fullUrl}`)
  next() // Proceed to the next middleware (including CORS)
})

app.use(cors({ origin: env.FRONTEND_ENDPOINT, credentials: true }))
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

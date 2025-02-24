import cookieParser from 'cookie-parser'
import cors from 'cors'
import https from 'https'
import { StatusCodes } from 'http-status-codes'
import swaggerDocs from './api/api-doc'
import env from './config'
import { verifyToken } from './middlewares/tokenVerification'
import authRoutes from './routes/authRoutes'
import chatRoutes from './routes/chatRoutes'
import settingsRoutes from './routes/settingsRoutes'
import express from 'express'
import fs from 'fs'
import path from 'path'

const app = express()

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../private/cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../private/cert', 'cert.pem'))
}

// MIDDLEWARES
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

const server = https.createServer(sslOptions, app)

export default server

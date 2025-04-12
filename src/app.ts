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
import express from 'express'

const app = express()

// MIDDLEWARES
const allowedOrigins = env.FRONTEND_ENDPOINTS.split(',')

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true)
//       } else {
//         console.error(
//           `${origin} is not specified within ${allowedOrigins}, blocked by CORS`
//         )
//         callback(new Error('Not allowed by CORS'))
//       }
//     },
//     credentials: true
//   })
// )

app.use(cors({ origin: '*', credentials: true }))

app.use(express.json())
app.use(cookieParser())

app.use(authRoutes)

app.use('/authed', verifyToken, [settingsRoutes, chatRoutes])

swaggerDocs(app, 'api/docs')

// ROUTES
app.get('/health', (_, res) => {
  res.status(StatusCodes.OK).send('Up and running!\n')
})

const server = http.createServer(app)

export default server

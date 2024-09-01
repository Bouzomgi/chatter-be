import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '../config'
import { IncomingMessage } from 'http'

const verifyTokenWebSocket = async (
  req: IncomingMessage
): Promise<number | null> => {
  try {
    console.log('attempting to authenticate')

    const cookies = req.headers.cookie
    if (!cookies) return null

    // Extract the token from cookies
    const token = cookies
      .split(';')
      .find((c) => c.trim().startsWith('auth-token='))
      ?.split('=')[1]
    if (!token) return null

    // Verify the token
    const decoded = (await jwt.verify(token, env.TOKEN_SECRET)) as JwtPayload
    return decoded.userId
  } catch {
    return null
  }
}

export default verifyTokenWebSocket

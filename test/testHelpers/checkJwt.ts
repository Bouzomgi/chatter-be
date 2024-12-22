import env from '@src/config'
import jwt from 'jsonwebtoken'

async function isJwtValid(token: string) {
  try {
    await jwt.verify(token, env.TOKEN_SECRET)
    return true
  } catch {
    return false
  }
}

export default isJwtValid

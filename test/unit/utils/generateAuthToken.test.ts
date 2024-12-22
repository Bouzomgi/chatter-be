import env from '@src/config'
import generateAuthToken from '@src/utils/generateAuthToken'
import jwt from 'jsonwebtoken'

describe('generateAuthToken', () => {
  const userId = 1

  it('should generate a valid JWT with the correct payload', () => {
    const token = generateAuthToken(userId)
    const decoded = jwt.verify(token, env.TOKEN_SECRET) as jwt.JwtPayload
    expect(decoded.userId).toBe(userId)
  })
})

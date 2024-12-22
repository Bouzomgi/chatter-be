import generateAuthToken from '@src/utils/generateAuthToken'
import verifyTokenWebSocket from '@src/websocket/validate'
import { IncomingMessage } from 'http'

describe('verifyTokenWebSocket', () => {
  const userId = 1
  let mockReq: IncomingMessage

  beforeEach(() => {
    mockReq = {
      headers: {
        cookie: ''
      }
    } as unknown as IncomingMessage
  })

  it('should return userId when token is valid', async () => {
    const validToken = generateAuthToken(userId)
    mockReq.headers.cookie = `auth-token=${validToken}`

    const result = await verifyTokenWebSocket(mockReq)
    expect(result).toBe(userId)
  })

  it('should return null when token is invalid', async () => {
    const token = 'invalidToken'
    mockReq.headers.cookie = `auth-token=${token}`

    const result = await verifyTokenWebSocket(mockReq)
    expect(result).toBeNull()
  })

  it('should return null when no token is found in cookies', async () => {
    mockReq.headers.cookie = ''

    const result = await verifyTokenWebSocket(mockReq)
    expect(result).toBeNull()
  })

  it('should return null when cookie is empty or token is undefined', async () => {
    mockReq.headers.cookie = 'auth-token='

    const result = await verifyTokenWebSocket(mockReq)
    expect(result).toBeNull()
  })
})

import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import { AuthedRequest } from '../../../../src/middlewares/tokenVerification'
import { prismaMock } from '../../utils/singleton'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, res, next) => {
    ;(req as AuthedRequest).userId = 1
    return next()
  })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /userHeads', () => {
  it('should successfully get user heads on valid request', async () => {
    const mockedUserHeadsDbRes = [
      {
        id: 1,
        username: 'adam',
        email: 'adam@a.com',
        password: 'a',
        profile: {
          id: 1,
          userId: 1,
          avatar: 'my-avatar'
        }
      }
    ]

    prismaMock.user.findMany.mockResolvedValueOnce(mockedUserHeadsDbRes)

    const expectedBody = [
      {
        userId: 1,
        avatar: 'my-avatar',
        username: 'adam'
      }
    ]

    const res = await request(app).get('/authed/userHeads').send()

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expectedBody)
  })

  it('should fail if the request is invalid', async () => {
    const reqBody = { members: ['1'], content: 'lorem ipsem' }

    const res = await request(app).post('/authed/message').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

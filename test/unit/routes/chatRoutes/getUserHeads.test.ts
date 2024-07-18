import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { prismaMock } from '../../utils/singleton'
import { getAvatar } from '../../../../src/storage/s3Accessors'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/userHeads', 'get'>).userId = 1
    return next()
  })
}))

jest.mock('../../../../src/storage/s3Accessors', () => ({
  getAvatar: jest.fn().mockResolvedValue({
    name: 'my-avatar',
    url: 'www.my-avatar.com'
  })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /authed/userHeads', () => {
  it('should successfully get user heads on valid request', async () => {
    const mockedUserHeadsDbRes = [
      {
        id: 1,
        userId: 1,
        username: 'adam',
        avatar: 'my-avatar'
      }
    ]

    prismaMock.profile.findMany.mockResolvedValueOnce(mockedUserHeadsDbRes)

    const expectedBody = [
      {
        userId: 1,
        username: 'adam',
        avatar: {
          name: 'my-avatar',
          url: 'www.my-avatar.com'
        }
      }
    ]

    const res = await request(app).get('/authed/userHeads').send()

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expectedBody)
  })

  it('should fail if there is a failure', async () => {
    const mockedUserHeadsDbRes = [
      {
        id: 1,
        userId: 1,
        username: 'adam',
        avatar: 'my-avatar'
      }
    ]

    prismaMock.profile.findMany.mockResolvedValueOnce(mockedUserHeadsDbRes)
    ;(getAvatar as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).post('/authed/message').send()

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

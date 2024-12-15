import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import { prismaMock } from '../../utils/setup'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { getDefaultAvatars } from '../../../../src/storage/s3Accessors'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/api/authed/defaultAvatars', 'post'>).userId = 1
    return next()
  })
}))

jest.mock('../../../../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest
    .fn()
    .mockResolvedValue([
      { name: 'mocked-avatar', url: 'www.mocked-avatar.com' }
    ])
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /api/authed/defaultAvatars', () => {
  it("should return the default avatars and the user's current avatar successfully", async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'adam',
      avatar: 'mocked-avatar'
    })

    const res = await request(app).get('/api/authed/defaultAvatars').send()

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual({
      defaultAvatars: [
        {
          name: 'mocked-avatar',
          url: 'www.mocked-avatar.com'
        }
      ]
    })
  })

  it('should fail if getDefaultAvatar fails', async () => {
    ;(getDefaultAvatars as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).get('/api/authed/defaultAvatars').send()

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

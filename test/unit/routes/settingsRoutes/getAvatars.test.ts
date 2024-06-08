import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import { prismaMock } from '../../utils/singleton'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { getDefaultAvatars } from '../../../../src/storage/s3Accessors'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/setAvatar', 'post'>).userId = 1
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

describe('GET /avatars', () => {
  it("should return the default avatars and the user's current avatar successfully", async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'adam',
      avatar: 'mocked-avatar'
    })

    const res = await request(app).get('/authed/avatars').send()

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual({
      currentAvatar: 'mocked-avatar',
      defaultAvatars: [
        {
          name: 'mocked-avatar',
          url: 'www.mocked-avatar.com'
        }
      ]
    })
  })

  it("should fail if cannot find user's profile", async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/authed/avatars').send()

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if getDefaultAvatar fails', async () => {
    ;(getDefaultAvatars as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).get('/authed/avatars').send()

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

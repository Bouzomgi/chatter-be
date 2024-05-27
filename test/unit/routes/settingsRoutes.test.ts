import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../src/app'
import { prismaMock } from '../utils/singleton'
import { AuthedRequest } from '../../../src/middlewares/tokenVerification'
import { getDefaultAvatars } from '../../../src/storage/s3Accessors'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest).userId = 1
    return next()
  })
}))

jest.mock('../../../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest.fn()
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
  ;(getDefaultAvatars as jest.Mock).mockResolvedValue(['mocked-avatar'])
})

describe('POST /avatar', () => {
  const sampleReq = { avatar: 'mocked-avatar' }

  it("should change a user's avatar successfully", async () => {
    const sampleProfile = { id: 1, userId: 1, avatar: 'mocked-avatar' }

    prismaMock.profile.update.mockResolvedValueOnce(sampleProfile)

    const res = await request(app).post('/authed/avatar').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.OK)
  })

  it("should fail if a user's profile cannot be updated", async () => {
    prismaMock.profile.update.mockRejectedValue(undefined)

    const res = await request(app).post('/authed/avatar').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if supplied avatar does not exist', async () => {
    const sampleReq = { avatar: 'unknown-avatar' }

    const res = await request(app).post('/authed/avatar').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/authed/avatar').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

describe('GET /avatars', () => {
  it("should return the default avatars and the user's current avatar successfully", async () => {
    prismaMock.profile.findUnique.mockResolvedValue({
      id: 1,
      userId: 1,
      avatar: 'mocked-avatar'
    })

    const res = await request(app).get('/authed/avatars').send()

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual({
      currentAvatar: 'mocked-avatar',
      defaultAvatars: ['mocked-avatar']
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
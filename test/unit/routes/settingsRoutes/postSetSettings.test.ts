import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import { prismaMock } from '../../utils/singleton'
import AuthedRequest from '../../../../src/middlewares/authedRequest'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/setSettings', 'post'>).userId = 1
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

describe('POST /authed/setSettings', () => {
  const sampleReq = { avatar: 'mocked-avatar' }

  it("should change a user's avatar successfully", async () => {
    const sampleProfile = {
      id: 1,
      userId: 1,
      username: 'adam',
      avatar: 'mocked-avatar'
    }

    prismaMock.profile.update.mockResolvedValueOnce(sampleProfile)

    const res = await request(app).post('/authed/setSettings').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.OK)
  })

  it("should fail if a user's profile cannot be updated", async () => {
    prismaMock.profile.update.mockRejectedValue(undefined)

    const res = await request(app).post('/authed/setSettings').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if supplied avatar does not exist', async () => {
    const sampleReq = { avatar: 'unknown-avatar' }

    const res = await request(app).post('/authed/setSettings').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/authed/setSettings').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

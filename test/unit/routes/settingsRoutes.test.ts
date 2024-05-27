import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../src/app'
import { prismaMock } from '../utils/singleton'
import { AuthedRequest } from '../../../src/middlewares/tokenVerification'
import { getDefaultAvatars } from '../../../src/storage/s3Accessors'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, res, next) => {
    ;(req as AuthedRequest).userId = 1
    return next()
  })
}))

jest.mock('../../../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest.fn(() => 'mocked-avatar')
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('POST /setAvatar', () => {
  const sampleReq = { avatar: 'mocked-avatar' }

  it("should change a user's avatar successfully", async () => {
    const sampleProfile = { id: 1, userId: 1, avatar: 'mocked-avatar' }

    prismaMock.profile.update.mockResolvedValue(sampleProfile)

    const res = await request(app).post('/authed/setAvatar').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.OK)
  })

  it("should fail if a user's profile cannot be updated", async () => {
    prismaMock.profile.update.mockRejectedValue(
      new Error('could not update database')
    )

    const res = await await request(app)
      .post('/authed/setAvatar')
      .send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if supplied avatar does not exist', async () => {
    ;(getDefaultAvatars as jest.Mock).mockImplementation(() => 'unknown')

    const res = await request(app).post('/authed/setAvatar').send(sampleReq)

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/authed/setAvatar').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

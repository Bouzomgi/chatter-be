import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/logout', 'post'>).userId = 1
    return next()
  })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('POST /authed/logout', () => {
  it('should return successfully when called', async () => {
    const res = await request(app).post('/authed/logout').send()

    expect(res.statusCode).toBe(StatusCodes.OK)
  })
})

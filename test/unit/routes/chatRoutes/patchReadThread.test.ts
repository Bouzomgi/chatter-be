import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { prismaMock } from '../../utils/setup'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(
      req as AuthedRequest<'/api/authed/readThread/{threadId}', 'patch'>
    ).userId = 1
    return next()
  })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('PATCH /api/authed/readThread/:threadId', () => {
  it('should successfully read a thread given a valid threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValueOnce({
      id: 1,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: 1
    })

    prismaMock.thread.update.mockResolvedValueOnce({
      id: 1,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: null
    })

    const res = await request(app).patch('/api/authed/readThread/1')

    expect(res.statusCode).toBe(StatusCodes.OK)
  })

  it('should fail if user does not have access to the given threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValueOnce(null)

    const res = await request(app).patch('/api/authed/readThread/1')

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).patch('/api/authed/readThread/1a')

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

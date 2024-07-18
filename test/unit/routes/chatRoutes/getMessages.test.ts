import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { prismaMock } from '../../utils/singleton'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/messages/{threadId}', 'get'>).userId = 1
    return next()
  })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /authed/messages/:threadId', () => {
  it('should successfully get messages given a valid threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValueOnce({
      id: 1,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: null
    })

    const mockedThreadMessagesDbRes = {
      id: 1,
      threads: [{ id: 1, conversationId: 1, member: 1, unseen: null }],
      messages: [
        {
          id: 1,
          conversationId: 1,
          fromUserId: 1,
          createdAt: '2022-01-01T00:00:00.000Z',
          content: 'lorem ipsem'
        }
      ]
    }

    prismaMock.conversation.findFirst.mockResolvedValueOnce(
      mockedThreadMessagesDbRes
    )

    const expectedBody = [
      {
        messageId: 1,
        fromUserId: 1,
        createdAt: '2022-01-01T00:00:00.000Z',
        content: 'lorem ipsem'
      }
    ]

    const res = await request(app).get('/authed/messages/1')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expectedBody)
  })

  it('should fail if user does not have access to the given threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValue(null)

    const res = await request(app).get('/authed/messages/1')

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).get('/authed/messages/1a')

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

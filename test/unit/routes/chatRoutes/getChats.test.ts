import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { prismaMock } from '../../utils/singleton'
import { pullChatDetails } from '../../../../src/queries/pullChatDetails'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/chats', 'get'>).userId = 1
    return next()
  })
}))

jest.mock('../../../../src/queries/pullChatDetails', () => ({
  pullChatDetails: jest.fn().mockResolvedValue([
    {
      conversationId: 1,
      threadId: 1,
      memberId: 2
    }
  ])
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /authed/chats', () => {
  it('should successfully get chats', async () => {
    prismaMock.message.findMany.mockResolvedValueOnce([
      {
        id: 1,
        conversationId: 1,
        fromUserId: 2,
        createdAt: new Date('2022-01-01T00:00:00.000Z'),
        content: 'lorem ipsem'
      }
    ])

    const expectedBody = [
      {
        conversationId: 1,
        threadId: 1,
        memberId: 2,
        messages: [
          {
            messageId: 1,
            fromUserId: 2,
            createdAt: '2022-01-01T00:00:00.000Z',
            content: 'lorem ipsem'
          }
        ]
      }
    ]

    const res = await request(app).get('/authed/chats')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expectedBody)
  })

  it('should fail if user does not have access to the given threadId', async () => {
    ;(pullChatDetails as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).get('/authed/chats')

    expect(res.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })
})

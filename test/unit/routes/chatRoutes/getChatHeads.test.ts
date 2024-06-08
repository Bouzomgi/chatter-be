import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import {
  CompleteMessage,
  pullLatestMessages
} from '../../../../src/queries/pullLatestMessages'
import { components } from '../../../../openapi/schema'

type Chathead = components['schemas']['Chathead']

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/chatHeads', 'get'>).userId = 1
    return next()
  })
}))

jest.mock('../../../../src/queries/pullLatestMessages', () => ({
  pullLatestMessages: jest.fn()
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

describe('GET /chatheads', () => {
  it('should successfully get sorted chatheads', async () => {
    const mockedLatestMessages: CompleteMessage[] = [
      {
        messageId: 1,
        fromUserId: 1,
        createdAt: '2022-01-02T00:00:00.000Z',
        content: 'lorem ipsum',
        conversationId: 1,
        threadId: 1,
        avatar: 'my-avatar'
      },
      {
        messageId: 2,
        fromUserId: 1,
        createdAt: '2022-01-01T00:00:00.000Z',
        content: 'dolor sit',
        conversationId: 2,
        threadId: 2,
        avatar: 'my-avatar',
        unseenMessageId: 1
      }
    ]

    ;(pullLatestMessages as jest.Mock).mockResolvedValueOnce(
      mockedLatestMessages
    )

    const expected: Chathead[] = [
      {
        conversationId: 1,
        threadId: 1,
        message: {
          messageId: 1,
          fromUserId: 1,
          content: 'lorem ipsum',
          createdAt: '2022-01-02T00:00:00.000Z'
        },
        avatar: {
          name: 'my-avatar',
          url: 'www.my-avatar.com'
        }
      },
      {
        conversationId: 2,
        threadId: 2,
        message: {
          messageId: 2,
          fromUserId: 1,
          content: 'dolor sit',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        avatar: {
          name: 'my-avatar',
          url: 'www.my-avatar.com'
        },
        unseenMessageId: 1
      }
    ]

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expected)
  })

  it('should successfully return nothing if user is not part of any conversations', async () => {
    ;(pullLatestMessages as jest.Mock).mockResolvedValueOnce([])

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual([])
  })

  it('should fail if pullChatHeads fails', async () => {
    ;(pullLatestMessages as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import { AuthedRequest } from '../../../../src/middlewares/tokenVerification'
import { ChatHead, pullChatHeads } from '../../../../src/queries/pullChatHeads'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest).userId = 1
    return next()
  })
}))

jest.mock('../../../../src/queries/pullChatHeads', () => ({
  pullChatHeads: jest.fn()
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /chatheads', () => {
  it('should successfully get sorted chatheads', async () => {
    const mockedChatHeadDbRes: ChatHead[] = [
      {
        conversationId: 1,
        content: 'lorem ipsum',
        createdAt: '2022-01-02T00:00:00.000Z',
        fromUser: 1,
        threadId: 1,
        avatar: 'my-avatar'
      },
      {
        conversationId: 2,
        content: 'dolor sit',
        createdAt: '2022-01-01T00:00:00.000Z',
        fromUser: 1,
        threadId: 2,
        avatar: 'my-avatar'
      },
      {
        conversationId: 3,
        content: 'amet consectetur',
        createdAt: '2022-01-03T00:00:00Z',
        fromUser: 1,
        threadId: 3,
        avatar: 'my-avatar'
      }
    ]

    ;(pullChatHeads as jest.Mock).mockResolvedValueOnce(mockedChatHeadDbRes)

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(mockedChatHeadDbRes)
  })

  it('should successfully return nothing if user is not part of any conversations', async () => {
    ;(pullChatHeads as jest.Mock).mockResolvedValueOnce('')

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual([])
  })

  it('should fail if pullChatHeads fails', async () => {
    ;(pullChatHeads as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

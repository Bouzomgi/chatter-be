import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { components } from '../../../../openapi/schema'
import {
  PrefetchedChatUserDetails,
  pullChatUsersDetails
} from '../../../../src/queries/pullChatUsersDetails'

type UserDetails = components['schemas']['UserDetails']

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/api/authed/chatUsersDetails', 'get'>).userId = 1
    return next()
  })
}))

jest.mock('../../../../src/queries/pullChatUsersDetails', () => ({
  pullChatUsersDetails: jest.fn()
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

describe('GET /chatUsersDetails', () => {
  it('should successfully get chat user details', async () => {
    const mockedLatestMessages: PrefetchedChatUserDetails[] = [
      {
        userId: 1,
        username: 'adam',
        avatar: 'my-avatar'
      }
    ]

    ;(pullChatUsersDetails as jest.Mock).mockResolvedValueOnce(
      mockedLatestMessages
    )

    const expected: UserDetails[] = [
      {
        userId: 1,
        username: 'adam',
        avatar: {
          name: 'my-avatar',
          url: 'www.my-avatar.com'
        }
      }
    ]

    const res = await request(app).get('/api/authed/chatUsersDetails')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expected)
  })

  it('should successfully return nothing if user is not part of any conversations', async () => {
    ;(pullChatUsersDetails as jest.Mock).mockResolvedValueOnce([])

    const res = await request(app).get('/api/authed/chatUsersDetails')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual([])
  })

  it('should fail if pullChatUsersDetails fails', async () => {
    ;(pullChatUsersDetails as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).get('/api/authed/chatUsersDetails')

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import AuthedRequest from '../../../../src/middlewares/authedRequest'
import { prismaMock } from '../../utils/setup'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../../../../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/api/authed/message', 'post'>).userId = 1
    return next()
  })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks

  prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock))
})

describe('POST /api/authed/message', () => {
  it('should successfully create post in a new conversation and thread if there is no existing thread', async () => {
    const reqBody = { members: [1, 2, 3], content: 'lorem ipsem' }

    // @ts-expect-error type signature of mockedConversationList is correct
    prismaMock.thread.groupBy.mockResolvedValueOnce([])

    const mockedUserList = [
      { id: 1, email: '', password: '' },
      { id: 2, email: '', password: '' },
      { id: 3, email: '', password: '' }
    ]
    prismaMock.user.findMany.mockResolvedValueOnce(mockedUserList)
    const findManyUserSpy = jest.spyOn(prismaMock.user, 'findMany')

    prismaMock.conversation.create.mockResolvedValueOnce({ id: 1 })
    const createConversationSpy = jest.spyOn(prismaMock.conversation, 'create')

    prismaMock.thread.create.mockResolvedValue({
      id: 1,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: null
    })
    const createThreadSpy = jest.spyOn(prismaMock.thread, 'create')

    prismaMock.message.create.mockResolvedValueOnce({
      id: 1,
      conversationId: 1,
      content: 'lorem ipsum',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      fromUserId: 1
    })

    prismaMock.thread.findMany.mockResolvedValue([
      {
        id: 1,
        conversationId: 1,
        memberId: 1,
        unseenMessageId: null
      },
      {
        id: 2,
        conversationId: 1,
        memberId: 2,
        unseenMessageId: null
      },
      {
        id: 3,
        conversationId: 1,
        memberId: 3,
        unseenMessageId: null
      }
    ])

    prismaMock.thread.update.mockResolvedValue({
      id: 2,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: 1
    })

    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: 1
    })

    const res = await request(app).post('/api/authed/message').send(reqBody)

    expect(findManyUserSpy).toHaveBeenCalled()
    expect(createConversationSpy).toHaveBeenCalled()
    expect(createThreadSpy).toHaveBeenCalledTimes(3)
    expect(res.statusCode).toBe(StatusCodes.CREATED)
    expect(res.body).toEqual({
      conversationId: 1,
      threadId: 1,
      members: [1, 2, 3],
      message: {
        messageId: 1,
        fromUserId: 1,
        createdAt: new Date('2024-01-01T00:00:00Z').toString(),
        content: 'lorem ipsum'
      }
    })
  })

  it('should create post in existing conversation if there is an existing thread', async () => {
    const reqBody = { members: [1, 2, 3], content: 'lorem ipsem' }

    // @ts-expect-error type signature of mockedConversationList is correct
    prismaMock.thread.groupBy.mockResolvedValueOnce([{ conversationId: 1 }])

    // will only be called when there is no existing conversation
    const findManyUserSpy = jest.spyOn(prismaMock.user, 'findMany')

    const mockedUserList = [
      { id: 1, username: '', email: '', password: '' },
      { id: 2, username: '', email: '', password: '' }
    ]
    prismaMock.user.findMany.mockResolvedValueOnce(mockedUserList)

    const createConversationSpy = jest.spyOn(prismaMock.conversation, 'create')
    const createThreadSpy = jest.spyOn(prismaMock.thread, 'create')

    prismaMock.message.create.mockResolvedValueOnce({
      id: 1,
      conversationId: 1,
      content: 'lorem ipsum',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      fromUserId: 1
    })

    prismaMock.thread.findMany.mockResolvedValue([
      {
        id: 1,
        conversationId: 1,
        memberId: 1,
        unseenMessageId: null
      },
      {
        id: 2,
        conversationId: 1,
        memberId: 2,
        unseenMessageId: null
      },
      {
        id: 3,
        conversationId: 1,
        memberId: 3,
        unseenMessageId: null
      }
    ])

    prismaMock.thread.update.mockResolvedValueOnce({
      id: 2,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: 1
    })

    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      memberId: 1,
      unseenMessageId: 1
    })

    const res = await request(app).post('/api/authed/message').send(reqBody)

    expect(findManyUserSpy).not.toHaveBeenCalled()
    expect(createConversationSpy).not.toHaveBeenCalled()
    expect(createThreadSpy).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(StatusCodes.CREATED)
    expect(res.body).toEqual({
      conversationId: 1,
      threadId: 1,
      members: [1, 2, 3],
      message: {
        messageId: 1,
        fromUserId: 1,
        createdAt: new Date('2024-01-01T00:00:00Z').toString(),
        content: 'lorem ipsum'
      }
    })
  })

  it('should fail if a member does not exist', async () => {
    const reqBody = { members: [1, 2, 3], content: 'lorem ipsem' }

    // @ts-expect-error type signature of mockedConversationList is correct
    prismaMock.thread.groupBy.mockResolvedValueOnce([])

    const mockedUserList = [{ id: 1, username: '', email: '', password: '' }]
    prismaMock.user.findMany.mockResolvedValueOnce(mockedUserList)

    const createConversationSpy = jest.spyOn(prismaMock.conversation, 'create')

    const res = await request(app).post('/api/authed/message').send(reqBody)

    expect(createConversationSpy).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it("should fail if user is not part of the request's members", async () => {
    const reqBody = { members: [2, 3], content: 'lorem ipsem' }

    const res = await request(app).post('/api/authed/message').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if the request is invalid', async () => {
    const reqBody = { members: ['1'], content: 'lorem ipsem' }

    const res = await request(app).post('/api/authed/message').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

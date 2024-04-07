import app from '../src/app'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { AuthedRequest } from '../src/middlewares/tokenVerification'
import { prismaMock } from './utils/singleton'
import { Prisma } from '@prisma/client'

// Mocking the verifyToken middleware to call next immediately
jest.mock('../src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, res, next) => {
    ;(req as AuthedRequest).userId = 1
    return next()
  })
}))

describe('GET /chatheads', () => {
  it('should successfully get sorted chatheads', async () => {
    const mockedChatheadDbRes = [
      {
        id: 1,
        conversationId: 1,
        member: 1,
        conversation: {
          id: 1,
          messages: [
            {
              id: 1,
              content: 'lorem ipsum',
              createdAt: new Date('2022-01-02T00:00:00'),
              fromUser: 1,
              conversationId: 1
            }
          ]
        }
      },
      {
        id: 2,
        conversationId: 2,
        member: 1,
        conversation: {
          id: 2,
          messages: [
            {
              id: 2,
              content: 'dolor sit',
              createdAt: new Date('2022-01-01T00:00:00.000Z'),
              fromUser: 1,
              conversationId: 2
            }
          ]
        }
      },
      {
        id: 3,
        conversationId: 3,
        member: 1,
        conversation: {
          id: 3,
          messages: [
            {
              id: 3,
              content: 'amet consectetur',
              createdAt: new Date('2022-01-03T00:00:00'),
              fromUser: 1,
              conversationId: 3
            }
          ]
        }
      }
    ]

    const expectedBody = [
      {
        threadId: 2,
        messageId: 2,
        content: 'dolor sit',
        createdAt: '2022-01-01T00:00:00.000Z',
        fromUser: 1,
        conversationId: 2
      },
      {
        threadId: 1,
        messageId: 1,
        content: 'lorem ipsum',
        createdAt: '2022-01-02T00:00:00.000Z',
        fromUser: 1,
        conversationId: 1
      },
      {
        threadId: 3,
        messageId: 3,
        content: 'amet consectetur',
        createdAt: '2022-01-03T00:00:00.000Z',
        fromUser: 1,
        conversationId: 3
      }
    ]

    prismaMock.thread.findMany.mockResolvedValue(mockedChatheadDbRes)

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expectedBody)
  })

  it('should successfully return nothing if user is not part of any conversations', async () => {
    prismaMock.thread.findMany.mockResolvedValue([])

    const res = await request(app).get('/authed/chatheads')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.body).toEqual([])
  })
})

describe('GET /messages/:threadId', () => {
  it('should successfully get messages given a valid threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      member: 1
    })

    const mockedThreadMessagesDbRes = {
      id: 1,
      threads: [{ id: 1, conversationId: 1, member: 1 }],
      messages: [
        {
          id: 1,
          conversationId: 1,
          fromUser: 1,
          createdAt: new Date('2022-01-01T00:00:00.000Z'),
          content: 'lorem ipsem'
        }
      ]
    }

    prismaMock.conversation.findFirst.mockResolvedValue(
      mockedThreadMessagesDbRes
    )

    const expectedBody = [
      {
        id: 1,
        conversationId: 1,
        fromUser: 1,
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

describe('POST /message', () => {
  it('should successfully post a message given a valid threadId with an existing unseen message', async () => {
    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      member: 1
    })

    prismaMock.message.create.mockResolvedValue({
      id: 1,
      conversationId: 1,
      fromUser: 1,
      createdAt: new Date('2022-01-01T00:00:00.000Z'),
      content: 'lorem ipsem'
    })

    prismaMock.unseen.findUnique.mockResolvedValue({
      id: 1,
      threadId: 1,
      messageId: 1
    })

    const reqBody = { threadId: 1, content: 'lorem ipsem' }

    const res = await request(app).post('/authed/message').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CREATED)
    expect(prismaMock.unseen.create).not.toHaveBeenCalled()
  })

  it('should successfully post a message given a valid threadId with no unseen messages', async () => {
    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      member: 1
    })

    prismaMock.message.create.mockResolvedValue({
      id: 1,
      conversationId: 1,
      fromUser: 1,
      createdAt: new Date('2022-01-01T00:00:00.000Z'),
      content: 'lorem ipsem'
    })

    prismaMock.unseen.findUnique.mockResolvedValue(null)

    const reqBody = { threadId: 1, content: 'lorem ipsem' }

    const res = await request(app).post('/authed/message').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CREATED)
    expect(prismaMock.unseen.create).toHaveBeenCalled()
  })

  it('should fail if user does not have access to the given threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValue(null)

    const reqBody = { threadId: 1, content: 'lorem ipsem' }

    const res = await request(app).post('/authed/message').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/authed/message').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

describe('DELETE /readThread/:threadId', () => {
  it('should successfully read a thread given a valid threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      member: 1
    })

    prismaMock.unseen.delete.mockResolvedValue({
      id: 1,
      threadId: 1,
      messageId: 1
    })

    const res = await request(app).delete('/authed/readThread/1')

    expect(res.statusCode).toBe(StatusCodes.GONE)
  })

  it('should fail if user does not have access to the given threadId', async () => {
    prismaMock.thread.findUnique.mockResolvedValue(null)

    const res = await request(app).delete('/authed/readThread/1')

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if the given threadId does not have unseens', async () => {
    prismaMock.thread.findUnique.mockResolvedValue({
      id: 1,
      conversationId: 1,
      member: 1
    })

    prismaMock.unseen.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('no record to delete', {
        code: 'P2002',
        meta: {},
        clientVersion: '2.0.0'
      })
    )

    const res = await request(app).delete('/authed/readThread/1')

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).delete('/authed/readThread/1a')

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

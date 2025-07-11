import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import server from '@src/app'
import AuthedRequest from '@src/middlewares/authedRequest'
import { prismaMock } from '@test/setup/prismaMock'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

jest.mock('@src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/authed/chats', 'get'>).userId = 1
    return next()
  })
}))

describe('When prisma is down', () => {
  // Auth routes
  it('post /login should fail with a 500', async () => {
    prismaMock.profile.findUnique.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const loginBody: ExtractPathRequestBody<'/login', 'post'> = {
      username: 'adam',
      password: 'a'
    }
    const res = await request(server).post('/login').send(loginBody)
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('post /register should fail with a 500', async () => {
    prismaMock.user.findFirst.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const registerBody: ExtractPathRequestBody<'/register', 'post'> = {
      email: 'fred@example.com',
      username: 'fred',
      password: 'abcde'
    }
    const res = await request(server).post('/register').send(registerBody)
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  // Chat routes
  it('get /chats should fail with a 500', async () => {
    prismaMock.message.findMany.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await await request(server).get('/authed/chats').send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('get /chatUserDetails should fail with a 500', async () => {
    prismaMock.$queryRaw.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server).get('/authed/chatUsersDetails').send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('get /userHeads should fail with a 500', async () => {
    prismaMock.profile.findMany.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server).get('/authed/userHeads').send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('patch /readThread should fail with a 500', async () => {
    prismaMock.thread.findUnique.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server).patch('/authed/readThread/1').send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('post /message should fail with a 500', async () => {
    prismaMock.thread.findUnique.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const messageBody: ExtractPathRequestBody<'/authed/message', 'post'> = {
      members: [1, 2],
      content: 'my message'
    }

    const res = await request(server).post('/authed/message').send(messageBody)

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  // Settings routes
  it('post /setSettings should fail with a 500', async () => {
    prismaMock.profile.update.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const setSettingsBody: ExtractPathRequestBody<
      '/authed/setSettings',
      'post'
    > = {
      avatar: './avatars/default/avatar7.svg'
    }

    const res = await request(server)
      .post('/authed/setSettings')
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })
})

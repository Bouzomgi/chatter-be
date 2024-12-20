import { mockDeep, DeepMockProxy } from 'jest-mock-extended'
import prisma from '@src/database'
import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import server from '@src/app'
import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import generateAuthToken from '@src/utils/generateAuthToken'

jest.mock('@src/database', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  jest.resetAllMocks()
})

const authToken = generateAuthToken(1)

describe('When prisma is down', () => {
  // Auth routes
  it('post /login should fail with 500', async () => {
    prismaMock.profile.findUnique.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const loginBody: ExtractPathRequestBody<'/api/login', 'post'> = {
      username: 'adam',
      password: 'a'
    }
    const res = await request(server).post('/api/login').send(loginBody)
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('post /register should fail with 500', async () => {
    prismaMock.user.findFirst.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const registerBody: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'fred@example.com',
      username: 'fred',
      password: 'abcde'
    }
    const res = await request(server).post('/api/register').send(registerBody)
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  // Chat routes
  it('get /chats should fail with 500', async () => {
    prismaMock.message.findMany.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server)
      .get('/api/authed/chats')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('get /chatUserDetails should fail with 500', async () => {
    prismaMock.$queryRaw.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server)
      .get('/api/authed/chatUsersDetails')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('get /userHeads should fail with 500', async () => {
    prismaMock.profile.findMany.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server)
      .get('/api/authed/userHeads')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('patch /readThread should fail with 500', async () => {
    prismaMock.thread.findUnique.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const res = await request(server)
      .patch('/api/authed/readThread/1')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  it('post /message should fail with 500', async () => {
    prismaMock.thread.findUnique.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [1, 2],
      content: 'my message'
    }

    const res = await request(server)
      .post('/api/authed/message')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(messageBody)

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })

  // Settings routes
  it('post /setSettings should fail with 500', async () => {
    prismaMock.profile.update.mockRejectedValue(
      new Error('Cannot connect to database')
    )

    const setSettingsBody: ExtractPathRequestBody<
      '/api/authed/setSettings',
      'post'
    > = {
      avatar: './avatars/default/avatar7.svg'
    }

    const res = await request(server)
      .post('/api/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })
})

import request from 'supertest'
import app from '../src/app'
import { StatusCodes } from 'http-status-codes'
import env from '../src/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prismaMock } from './singleton'
import { getDefaultAvatars } from '../src/storage/s3Accessors'

jest.mock('bcrypt')
jest.mock('jsonwebtoken')

jest.mock('../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest.fn()
}))

const server = app.listen(env.PORT, () =>
  console.log(`Listening on port ${env.PORT}`)
)

afterAll(async () => {
  if (server) {
    await server.close()
  }
})

describe('POST /register', () => {
  const sampleBody = {
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  const sampleUser = {
    id: 1,
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  beforeEach(() => {
    ;(bcrypt.genSalt as jest.Mock).mockResolvedValue('mocked-salt')
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('mocked-hash')
    ;(getDefaultAvatars as jest.Mock).mockResolvedValue('mocked-avatars')
  })

  it('should register a user successfully', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)

    const res = await request(app).post('/register').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.OK)
  })

  it('should fail registering when email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue(sampleUser)

    const res = await request(app).post('/register').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail registering when username already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null)
    prismaMock.user.findFirst.mockResolvedValueOnce(sampleUser)

    const res = await request(app).post('/register').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail registering when getDefaultAvatars fails', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    ;(getDefaultAvatars as jest.Mock).mockResolvedValue(undefined)

    const res = await request(app).post('/register').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

describe('POST /login', () => {
  const sampleBody = {
    username: 'Adam',
    password: 'abc123'
  }

  const sampleUser = {
    id: 1,
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  beforeEach(() => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(jwt.sign as jest.Mock).mockResolvedValue('mocked-jwt')
    prismaMock.user.findUnique.mockResolvedValue(sampleUser)
  })

  it('should login a user successfully', async () => {
    const res = await request(app).post('/login').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.headers['set-cookie'][0]).toMatch(
      RegExp('.*auth-token=mocked-jwt.*')
    )
  })

  it('should fail if username already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/login').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if password is invalid', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const res = await request(app).post('/login').send(sampleBody)

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })
})

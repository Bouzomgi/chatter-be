import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import app from '../../../src/app'
import { prismaMock } from '../utils/singleton'
import { getDefaultAvatars } from '../../../src/storage/s3Accessors'

jest.mock('bcrypt', () => ({
  genSalt: jest.fn(() => 'mocked-salt'),
  hash: jest.fn(() => 'mocked-hash'),
  compare: jest.fn(() => true)
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt')
}))

jest.mock('../../../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest.fn()
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
  ;(getDefaultAvatars as jest.Mock).mockResolvedValue(['mocked-avatar'])
})

describe('POST /register', () => {
  const reqBody = {
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  const mockedUserDbRes = {
    id: 1,
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  it('should register a user successfully', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)

    const res = await request(app).post('/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CREATED)
  })

  it('should fail when email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockedUserDbRes)

    const res = await request(app).post('/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail when username already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null)
    prismaMock.user.findFirst.mockResolvedValueOnce(mockedUserDbRes)

    const res = await request(app).post('/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail when getDefaultAvatars fails', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    ;(getDefaultAvatars as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).post('/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/register').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

describe('POST /login', () => {
  const reqBody = {
    username: 'Adam',
    password: 'abc123'
  }

  const mockedUserDbRes = {
    id: 1,
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue(mockedUserDbRes)
  })

  it('should login a user successfully', async () => {
    const res = await request(app).post('/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.headers['set-cookie'][0]).toMatch(
      RegExp('.*auth-token=mocked-jwt.*')
    )
  })

  it('should fail if username already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if password is invalid', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false)

    const res = await request(app).post('/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/login').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcrypt'
import app from '../../../../src/app'
import { prismaMock } from '../../utils/singleton'

jest.mock('bcrypt', () => ({
  compare: jest.fn(() => true)
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt')
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('POST /login', () => {
  const reqBody = {
    username: 'adam',
    password: 'abc123'
  }

  const mockedUserWithProfileDbRes = {
    user: {
      id: 1,
      email: 'a@gmail.com',
      password: 'abc123'
    },
    id: 1,
    userId: 1,
    username: 'adam',
    avatar: 'avatar-1'
  }

  beforeEach(() => {
    prismaMock.profile.findUnique.mockResolvedValue(mockedUserWithProfileDbRes)
  })

  it('should login a user successfully', async () => {
    const res = await request(app).post('/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.headers['set-cookie'][0]).toMatch(
      RegExp('.*auth-token=mocked-jwt.*')
    )
  })

  it('should fail if username does not exists', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null)

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

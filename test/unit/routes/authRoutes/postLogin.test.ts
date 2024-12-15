import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import bcrypt from 'bcryptjs'
import app from '../../../../src/app'
import { prismaMock } from '../../utils/setup'

jest.mock('bcryptjs', () => ({
  compare: jest.fn(() => true)
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt')
}))

jest.mock('../../../../src/storage/s3Accessors', () => ({
  getAvatar: jest
    .fn()
    .mockResolvedValue({ name: 'mocked-avatar', url: 'www.mocked-avatar.com' })
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('POST /api/login', () => {
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
    const res = await request(app).post('/api/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.headers['set-cookie'][0]).toMatch(
      RegExp('.*auth-token=mocked-jwt.*')
    )
    expect(res.body).toStrictEqual({
      userId: 1,
      username: 'adam',
      avatar: { name: 'mocked-avatar', url: 'www.mocked-avatar.com' }
    })
  })

  it('should fail if username does not exists', async () => {
    prismaMock.profile.findUnique.mockResolvedValue(null)

    const res = await request(app).post('/api/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if password is invalid', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValueOnce(false)

    const res = await request(app).post('/api/login').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/api/login').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

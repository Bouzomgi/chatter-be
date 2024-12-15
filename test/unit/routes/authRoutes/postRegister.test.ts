import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../../../src/app'
import { prismaMock } from '../../utils/setup'
import { getDefaultAvatars } from '../../../../src/storage/s3Accessors'

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(() => 'mocked-salt'),
  hash: jest.fn(() => 'mocked-hash')
}))

jest.mock('../../../../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest.fn().mockResolvedValue(['mocked-avatar'])
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('POST /api/register', () => {
  const reqBody = {
    email: 'a@gmail.com',
    username: 'Adam',
    password: 'abc123'
  }

  const mockedUserDbRes = {
    id: 1,
    email: 'a@gmail.com',
    password: 'abc123'
  }

  const mockedProfileDbRes = {
    id: 1,
    userId: 1,
    username: 'Adam',
    avatar: 'avatar-1'
  }

  it('should register a user successfully', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.profile.findFirst.mockResolvedValue(null)

    const res = await request(app).post('/api/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CREATED)
  })

  it('should fail when email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockedUserDbRes)

    const res = await request(app).post('/api/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail when username already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null)
    prismaMock.profile.findFirst.mockResolvedValueOnce(mockedProfileDbRes)

    const res = await request(app).post('/api/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail when getDefaultAvatars fails', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    prismaMock.profile.findFirst.mockResolvedValue(null)
    ;(getDefaultAvatars as jest.Mock).mockRejectedValueOnce(undefined)

    const res = await request(app).post('/api/register').send(reqBody)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should fail if request is invalid', async () => {
    const res = await request(app).post('/api/register').send({})

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

import request from 'supertest'
import app from '../src/app'
import { StatusCodes } from 'http-status-codes'
import env from '../src/config'
import bcrypt from 'bcrypt'
import { prismaMock } from './singleton'
import { getDefaultAvatars } from '../src/storage/s3Accessors'

jest.mock('../src/storage/s3Accessors', () => ({
  getDefaultAvatars: jest.fn()
}))

jest.mock('bcrypt')

describe('POST /register', () => {
  const server = app.listen(env.PORT, () =>
    console.log(`Listening on port ${env.PORT}`)
  )

  beforeEach(() => {
    ;(bcrypt.genSalt as jest.Mock).mockResolvedValue('mocked-salt')
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('mocked-hash')
    ;(getDefaultAvatars as jest.Mock).mockResolvedValue('mocked-avatars')
  })

  afterAll(async () => {
    if (server) {
      await server.close()
    }
  })

  it('should register a user successfully', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)

    const body = { email: 'a@gmail.com', username: 'Adam', password: 'abc123' }
    const res = await request(app).post('/register').send(body)

    expect(res.statusCode).toBe(StatusCodes.OK)
  })

  it('should fail registering when email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      email: 'a@gmail.com',
      username: 'Adam',
      password: 'abc123'
    })

    const body = { email: 'a@gmail.com', username: 'Adam', password: 'abc123' }
    const res = await request(app).post('/register').send(body)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail registering when username already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null)
    prismaMock.user.findFirst.mockResolvedValueOnce({
      id: 1,
      email: 'a@gmail.com',
      username: 'Adam',
      password: 'abc123'
    })

    const body = { email: 'a@gmail.com', username: 'Adam', password: 'abc123' }
    const res = await request(app).post('/register').send(body)

    expect(res.statusCode).toBe(StatusCodes.CONFLICT)
  })

  it('should fail registering when getDefaultAvatars fails', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)
    ;(getDefaultAvatars as jest.Mock).mockResolvedValue(undefined)

    const body = { email: 'a@gmail.com', username: 'Adam', password: 'abc123' }
    const res = await request(app).post('/register').send(body)

    expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

import request from 'supertest'
import app from '../src/app'
import { StatusCodes } from 'http-status-codes'

describe('GET /health', () => {
  it('should return a healthcheck response', async () => {
    const res = await request(app).get('/health')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.text).toBe('Up and running!')
  })
})

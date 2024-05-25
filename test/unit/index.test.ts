import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../src/app'

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /health', () => {
  it('should return a healthcheck response', async () => {
    const res = await request(app).get('/health')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.text).toBe('Up and running!')
  })
})

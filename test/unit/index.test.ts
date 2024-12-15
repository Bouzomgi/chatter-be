import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import app from '../../src/app'

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks
})

describe('GET /api/health', () => {
  it('should return a healthcheck response', async () => {
    const res = await request(app).get('/api/health')

    expect(res.statusCode).toBe(StatusCodes.OK)
  })
})

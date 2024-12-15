import request from 'supertest'
import server from '../../src/app'

describe('Healthcheck', () => {
  it('should respond with 200 on the /api/health endpoint', async () => {
    const res = await request(server).get('/api/health')
    expect(res.status).toBe(200)
  })
})

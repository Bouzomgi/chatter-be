import request from 'supertest'
import server from '../../src/app'

describe('Healthcheck', () => {
  it('should successfully respond to a healthcheck', async () => {
    const res = await request(server).get('/api/health')
    expect(res.status).toBe(200)
  })
})

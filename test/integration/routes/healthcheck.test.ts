import server from '@src/app'
import request from 'supertest'

describe('Healthcheck', () => {
  it('should successfully respond to a healthcheck', async () => {
    const res = await request(server).get('/api/health')
    expect(res.status).toBe(200)
  })
})

import request from 'supertest'
import server from '../../src/app'
import { ExtractPathRequestBody } from '../../openapi/typeExtractors'

describe('Login', () => {
  it('Login to an existing account', async () => {
    const loginBody: ExtractPathRequestBody<'/api/login', 'post'> = {
      username: 'adam',
      password: 'a'
    }
    const res = await request(server).post('/api/login').send(loginBody)
    expect(res.status).toBe(200)
  })

  it('Login to a nonexisting account', async () => {
    const loginBody: ExtractPathRequestBody<'/api/login', 'post'> = {
      username: 'marco',
      password: 'a'
    }
    const res = await request(server).post('/api/login').send(loginBody)
    expect(res.status).toBe(401)
  })
})

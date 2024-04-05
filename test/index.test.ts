import request from 'supertest'
import app from '../src/app'
import { StatusCodes } from 'http-status-codes'
import { Server } from 'http'
import env from '../src/config'

describe('GET /health', () => {
  let server: Server | null = null

  beforeEach(() => {
    server = app.listen(env.PORT, () =>
      console.log(`Listening on port ${env.PORT}`)
    )
  })

  afterAll(async () => {
    if (server) {
      await server.close()
    }
  })

  it('should return a healthcheck response', async () => {
    const res = await request(app).get('/health')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.text).toBe('Up and running!')
  })
})

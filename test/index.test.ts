import request from 'supertest'
import app from '../src/app'
import { StatusCodes } from 'http-status-codes'
import { Server } from 'http'

describe('GET /backend/', () => {
  let server: Server | null = null

  beforeEach(() => {
    server = app.listen(3000, () => console.log('Listening on port 3000'))
  })

  afterAll(async () => {
    if (server) {
      await server.close()
    }
  })

  it('should return a healthcheck response', async () => {
    const res = await request(app).get('/')

    expect(res.statusCode).toBe(StatusCodes.OK)
    expect(res.text).toBe('Hello World!')
  })
})

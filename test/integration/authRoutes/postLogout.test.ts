import request from 'supertest'
import server from '../../../src/app'
import getCookieValue from '../utils/getCookie'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'

describe('Logout', () => {
  it('should successfully logout when logged in', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .post('/api/logout')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.OK)

    const authTokenCookie = getCookieValue(res, 'authToken')
    expect(authTokenCookie).toBeUndefined()
  })
})

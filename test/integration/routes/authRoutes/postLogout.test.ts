import app from '@src/app'
import generateAuthToken from '@src/utils/generateAuthToken'
import getCookieValue from '@test/testHelpers/getCookie'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

describe('Logout', () => {
  it('should successfully logout when logged in', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.OK)

    const authTokenCookie = getCookieValue(res, 'auth-token')
    expect(authTokenCookie).toBeFalsy()
  })
})

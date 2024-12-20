import request from 'supertest'
import app from '@src/app'
import getCookieValue from '../../../testHelpers/getCookie'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '@src/utils/generateAuthToken'

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

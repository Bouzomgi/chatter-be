import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import server from '@src/app'
import isJwtValid from '@test/testHelpers/checkJwt'
import isS3SignedUrlValid from '@test/testHelpers/checkSignedUrl'
import getCookie from '@test/testHelpers/getCookie'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

describe('Login', () => {
  it('should login to an existing account', async () => {
    const loginBody: ExtractPathRequestBody<'/login', 'post'> = {
      username: 'adam',
      password: 'a'
    }
    const res = await request(server).post('/login').send(loginBody)
    expect(res.status).toBe(StatusCodes.OK)

    const avatarUrlValidity = await isS3SignedUrlValid(res.body.avatar.url)
    expect(avatarUrlValidity).toBe(true)

    const cookie = getCookie(res, 'auth-token')
    expect(cookie).toBeDefined()
    if (cookie) {
      const jwtValidity = isJwtValid(cookie)
      expect(jwtValidity).toBeTruthy
    }
  })

  it('should fail when attempting to login to an existing account with an incorrect', async () => {
    const loginBody: ExtractPathRequestBody<'/login', 'post'> = {
      username: 'adam',
      password: 'incorrect'
    }
    const res = await request(server).post('/login').send(loginBody)
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail when attempting to login to a nonexisting account', async () => {
    const loginBody: ExtractPathRequestBody<'/login', 'post'> = {
      username: 'marco',
      password: 'a'
    }
    const res = await request(server).post('/login').send(loginBody)
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail when attempting to login with a bad request', async () => {
    const loginBody1: ExtractPathRequestBody<'/login', 'post'> = {
      username: '',
      password: 'a'
    }
    const res1 = await request(server).post('/login').send(loginBody1)
    expect(res1.status).toBe(StatusCodes.BAD_REQUEST)

    const loginBody2: ExtractPathRequestBody<'/login', 'post'> = {
      username: 'adam',
      password: ''
    }
    const res2 = await request(server).post('/login').send(loginBody2)
    expect(res2.status).toBe(StatusCodes.BAD_REQUEST)
  })
})

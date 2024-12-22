import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import server from '@src/app'
import { doesConversationExist } from '@test/testHelpers/checkDatabase/conversationChecks'
import { isUsernameRegistered } from '@test/testHelpers/checkDatabase/userChecks'
import isJwtValid from '@test/testHelpers/checkJwt'
import getCookie from '@test/testHelpers/getCookie'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

/*
  Describes a sample user work flow

  Register -> Login -> Send Message -> Logout -> Try to send a message
*/

describe('User flow', () => {
  it('should successfully register for an account', async () => {
    const agent = request.agent(server)

    expect(await isUsernameRegistered('new_user')).toBe(false)

    // Register
    const registerBody: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'new_user@example.com',
      username: 'new_user',
      password: 'abcde'
    }
    const registerRes = await agent.post('/api/register').send(registerBody)
    expect(registerRes.status).toBe(StatusCodes.CREATED)

    expect(await isUsernameRegistered('new_user')).toBe(true)

    // Login
    const loginBody: ExtractPathRequestBody<'/api/login', 'post'> = {
      username: 'new_user',
      password: 'abcde'
    }
    const loginRes = await agent.post('/api/login').send(loginBody)
    expect(loginRes.status).toBe(StatusCodes.OK)

    const cookie = getCookie(loginRes, 'auth-token')
    expect(cookie).toBeDefined()
    if (cookie) {
      const jwtValidity = isJwtValid(cookie)
      expect(jwtValidity).toBeTruthy
    }

    // Send message
    const userId = loginRes.body.userId
    const messageBody: ExtractPathRequestBody<'/api/authed/message', 'post'> = {
      members: [1, userId],
      content: 'message in a new thread'
    }
    const messageRes = await agent.post('/api/authed/message').send(messageBody)
    expect(messageRes.status).toBe(StatusCodes.CREATED)

    expect(await doesConversationExist([1, userId])).toBe(true)

    // Logout
    const logoutRes = await agent.post('/api/logout').send()
    expect(logoutRes.status).toBe(StatusCodes.OK)

    const cookieAfterLogout = getCookie(logoutRes, 'auth-token')
    expect(cookieAfterLogout).toBeFalsy()

    // Attempt to send another message
    const messageBody2: ExtractPathRequestBody<'/api/authed/message', 'post'> =
      {
        members: [1, userId],
        content: 'another message'
      }
    const messageRes2 = await agent
      .post('/api/authed/message')
      .send(messageBody2)
    expect(messageRes2.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

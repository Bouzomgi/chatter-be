import server from '@src/app'
import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import prisma from '@src/database'

describe('Register', () => {
  it('should successfully register a new account', async () => {
    // account should not exist yet
    expect(await isUsernameRegistered('fred')).toBe(false)
    expect(await isEmailRegistered('fred@example.com')).toBe(false)

    const registerBody: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'fred@example.com',
      username: 'fred',
      password: 'abcde'
    }
    const registerRes = await request(server)
      .post('/api/register')
      .send(registerBody)
    expect(registerRes.status).toBe(StatusCodes.CREATED)

    expect(await isUsernameRegistered('fred')).toBe(true)
  })

  it('should fail registration if an account already exists with the same username', async () => {
    expect(await isUsernameRegistered('adam')).toBe(true)
    expect(await isEmailRegistered('brand_new@example.com')).toBe(false)

    const registerBody: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'brand_new@example.com',
      username: 'adam',
      password: 'abcde'
    }
    const registerRes = await request(server)
      .post('/api/register')
      .send(registerBody)
    expect(registerRes.status).toBe(StatusCodes.CONFLICT)

    expect(await isEmailRegistered('brand_new@example.com')).toBe(false)
  })

  it('should fail registration if an account already exists with the same email', async () => {
    expect(await isUsernameRegistered('emily')).toBe(false)
    expect(await isEmailRegistered('adam@example.com')).toBe(true)

    const registerBody: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'adam@example.com',
      username: 'emily',
      password: 'abcde'
    }
    const registerRes = await request(server)
      .post('/api/register')
      .send(registerBody)
    expect(registerRes.status).toBe(StatusCodes.CONFLICT)

    expect(await isUsernameRegistered('emily')).toBe(false)
  })

  it('should fail registration if request is bad', async () => {
    // Bad email
    const registerBody1: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'not_an_email',
      username: 'moe',
      password: 'abcde'
    }
    const registerRes1 = await request(server)
      .post('/api/register')
      .send(registerBody1)
    expect(registerRes1.status).toBe(StatusCodes.BAD_REQUEST)

    // Username has an invalid character
    const registerBody2: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'moe@example.com',
      username: 'm@e',
      password: 'a'
    }
    const registerRes2 = await request(server)
      .post('/api/register')
      .send(registerBody2)
    expect(registerRes2.status).toBe(StatusCodes.BAD_REQUEST)

    // No username
    const registerBody3: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'moe@example.com',
      username: '',
      password: 'abcde'
    }
    const registerRes3 = await request(server)
      .post('/api/register')
      .send(registerBody3)
    expect(registerRes3.status).toBe(StatusCodes.BAD_REQUEST)

    // Password is too short
    const registerBody4: ExtractPathRequestBody<'/api/register', 'post'> = {
      email: 'moe@example.com',
      username: 'moe',
      password: 'a'
    }
    const registerRes4 = await request(server)
      .post('/api/register')
      .send(registerBody4)
    expect(registerRes4.status).toBe(StatusCodes.BAD_REQUEST)
  })
})

const isUsernameRegistered = async (username: string) => {
  const user = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: true
    }
  })

  return user !== null
}

const isEmailRegistered = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true
    }
  })

  return user !== null
}

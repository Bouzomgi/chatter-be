import request from 'supertest'
import server from '../../../src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'
import { ExtractPathRequestBody } from '../../../openapi/typeExtractors'
import prisma from '../../../src/database'

describe('Set Settings', () => {
  it('should successfully set an avatar', async () => {
    expect(await getAvatar(1)).toBe('./avatars/default/avatar3.svg')

    const authToken = generateAuthToken(1)
    const setSettingsBody: ExtractPathRequestBody<
      '/api/authed/setSettings',
      'post'
    > = {
      avatar: './avatars/default/avatar7.svg'
    }
    const res = await request(server)
      .post('/api/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.OK)
    expect(await getAvatar(1)).toBe('./avatars/default/avatar7.svg')
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).post('/api/authed/setSettings').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if non-existent avatar is selected', async () => {
    const authToken = generateAuthToken(1)
    const setSettingsBody: ExtractPathRequestBody<
      '/api/authed/setSettings',
      'post'
    > = {
      avatar: 'fake-avatar'
    }
    const res = await request(server)
      .post('/api/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if request is malformed', async () => {
    // avatar is empty
    const authToken = generateAuthToken(1)
    const setSettingsBody: ExtractPathRequestBody<
      '/api/authed/setSettings',
      'post'
    > = {
      avatar: ''
    }
    const res = await request(server)
      .post('/api/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.BAD_REQUEST)
  })
})

const getAvatar = async (userId: number) => {
  const user = await prisma.profile.findUnique({
    where: { userId }
  })

  return user?.avatar
}

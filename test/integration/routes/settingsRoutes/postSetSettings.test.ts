import { ExtractPathRequestBody } from '@openapi/typeExtractors'
import server from '@src/app'
import generateAuthToken from '@src/utils/generateAuthToken'
import { getAvatar } from '@test/testHelpers/checkDatabase/userChecks'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

describe('Set Settings', () => {
  it('should successfully set an avatar', async () => {
    expect(await getAvatar(1)).toBe('./avatars/default/avatar3.svg')

    const authToken = generateAuthToken(1)
    const setSettingsBody: ExtractPathRequestBody<
      '/authed/setSettings',
      'post'
    > = {
      avatar: './avatars/default/avatar7.svg'
    }
    const res = await request(server)
      .post('/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.OK)
    expect(await getAvatar(1)).toBe('./avatars/default/avatar7.svg')
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).post('/authed/setSettings').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if non-existent avatar is selected', async () => {
    const authToken = generateAuthToken(1)
    const setSettingsBody: ExtractPathRequestBody<
      '/authed/setSettings',
      'post'
    > = {
      avatar: 'fake-avatar'
    }
    const res = await request(server)
      .post('/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })

  it('should fail if request is malformed', async () => {
    // avatar is empty
    const authToken = generateAuthToken(1)
    const setSettingsBody: ExtractPathRequestBody<
      '/authed/setSettings',
      'post'
    > = {
      avatar: ''
    }
    const res = await request(server)
      .post('/authed/setSettings')
      .set('Cookie', [`auth-token=${authToken}`])
      .send(setSettingsBody)

    expect(res.status).toBe(StatusCodes.BAD_REQUEST)
  })
})

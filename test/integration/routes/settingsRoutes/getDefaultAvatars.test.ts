import { components } from '@openapi/schema'
import server from '@src/app'
import generateAuthToken from '@src/utils/generateAuthToken'
import isS3SignedUrlValid from '@test/testHelpers/checkSignedUrl'
import normalizeAvatar from '@test/testHelpers/normalizeAvatar'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

type Avatar = components['schemas']['Avatar']

describe('Get Default Avatars', () => {
  it('should successfully get default avatars', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/authed/defaultAvatars')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.OK)

    const urlValidityPromises: Promise<boolean>[] = res.body.map(
      (avatar: Avatar) => isS3SignedUrlValid(avatar.url)
    )
    const urlValidities = await Promise.all(urlValidityPromises)
    expect(urlValidities.every((elem) => elem === true)).toBe(true)

    const normalizedResponse = res.body.map(normalizeAvatar)
    const expectedResponse = [
      { name: 'avatars/default/avatar1.svg' },
      { name: 'avatars/default/avatar2.svg' },
      { name: 'avatars/default/avatar3.svg' },
      { name: 'avatars/default/avatar4.svg' },
      { name: 'avatars/default/avatar5.svg' },
      { name: 'avatars/default/avatar6.svg' },
      { name: 'avatars/default/avatar7.svg' },
      { name: 'avatars/default/avatar8.svg' },
      { name: 'avatars/default/avatar9.svg' }
    ]

    expect(normalizedResponse).toEqual(expectedResponse)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/authed/defaultAvatars').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

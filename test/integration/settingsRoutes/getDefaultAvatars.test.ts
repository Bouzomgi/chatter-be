import request from 'supertest'
import server from '../../../src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'
import isS3SignedUrlValid from '../utils/checkSignedUrl'
import { components } from '../../../openapi/schema'
import normalizeAvatar from '../utils/normalizeAvatar'

type Avatar = components['schemas']['Avatar']

describe('Get Default Avatars', () => {
  it('should successfully get default avatars', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/api/authed/defaultAvatars')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()
    expect(res.status).toBe(StatusCodes.OK)

    res.body.forEach((avatar: Avatar) => {
      const isUrlValid = isS3SignedUrlValid(avatar.url)
      expect(isUrlValid).toBeTruthy()
    })

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
    const res = await request(server).get('/api/authed/defaultAvatars').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

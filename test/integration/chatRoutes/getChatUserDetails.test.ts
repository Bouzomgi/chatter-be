import request from 'supertest'
import server from '../../../src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'
import normalizeAvatar from '../utils/normalizeAvatar'
import { components } from '../../../openapi/schema'

type ChatDetails = components['schemas']['UserDetails']

describe('Chat User Details', () => {
  it('should successfully get chat users details', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/api/authed/chatUsersDetails')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.OK)

    const normalizedResponse = res.body.map((elem: ChatDetails) => ({
      ...elem,
      avatar: normalizeAvatar(elem.avatar)
    }))

    const expectedResponse = [
      {
        userId: 2,
        username: 'britta',
        avatar: {
          name: './avatars/default/avatar2.svg'
        }
      },
      {
        userId: 3,
        username: 'carl',
        avatar: {
          name: './avatars/default/avatar4.svg'
        }
      },
      {
        userId: 4,
        username: 'dana',
        avatar: {
          name: './avatars/default/avatar1.svg'
        }
      }
    ]

    expect(normalizedResponse).toEqual(expectedResponse)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/api/authed/chatUsersDetails').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

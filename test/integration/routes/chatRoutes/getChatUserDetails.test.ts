import { components } from '@openapi/schema'
import server from '@src/app'
import generateAuthToken from '@src/utils/generateAuthToken'
import normalizeAvatar from '@test/testHelpers/normalizeAvatar'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

type ChatDetails = components['schemas']['UserDetails']

describe('Chat User Details', () => {
  it('should successfully get chat users details', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/authed/chatUsersDetails')
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
    const res = await request(server).get('/authed/chatUsersDetails').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

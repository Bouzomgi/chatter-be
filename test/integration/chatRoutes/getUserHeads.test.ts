import request from 'supertest'
import server from '../../../src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'
import normalizeAvatar from '../utils/normalizeAvatar'
import { components } from '../../../openapi/schema'

type UserHead = components['schemas']['UserHead']

describe('User Heads', () => {
  it('should successfully get user heads', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/api/authed/userHeads')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.OK)

    const normalizedResponse = res.body.map((elem: UserHead) => ({
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
      },
      {
        userId: 5,
        username: 'edward',
        avatar: {
          name: './avatars/default/avatar5.svg'
        }
      }
    ]

    expect(normalizedResponse).toEqual(expectedResponse)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/api/authed/userHeads').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

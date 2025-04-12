import { components } from '@openapi/schema'
import server from '@src/app'
import generateAuthToken from '@src/utils/generateAuthToken'
import normalizeAvatar from '@test/testHelpers/normalizeAvatar'
import { StatusCodes } from 'http-status-codes'
import _ from 'lodash'
import request from 'supertest'

type UserHead = components['schemas']['UserHead']
type NormalizedUserHead = Omit<UserHead, 'avatar'> & {
  avatar: Omit<UserHead['avatar'], 'url'>
}

describe('User Heads', () => {
  it('should successfully get user heads', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/authed/userHeads')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.OK)

    const normalizedResponse: NormalizedUserHead[] = res.body.map(
      (elem: UserHead) => ({
        ...elem,
        avatar: normalizeAvatar(elem.avatar)
      })
    )

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

    // Check that the response contains all the expected values
    expect(
      expectedResponse.every((item) =>
        normalizedResponse.some((responseItem) => _.isEqual(item, responseItem))
      )
    ).toBe(true)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/authed/userHeads').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

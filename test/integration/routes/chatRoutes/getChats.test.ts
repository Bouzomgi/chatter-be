import server from '@src/app'
import generateAuthToken from '@src/utils/generateAuthToken'
import { StatusCodes } from 'http-status-codes'
import request from 'supertest'

describe('Chats', () => {
  it('should successfully get chats', async () => {
    const authToken = generateAuthToken(1)

    const res = await request(server)
      .get('/api/authed/chats')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    const expectedResponse = [
      {
        conversationId: 1,
        threadId: 1,
        members: [1, 2],
        unseenMessageId: 1,
        messages: [
          {
            messageId: 1,
            createdAt: '2024-03-15T10:01:00.000Z',
            content: 'Hi Britta, how are you?',
            fromUserId: 1
          },
          {
            messageId: 2,
            createdAt: '2024-03-16T10:00:00.000Z',
            content: "Hey Adam, I'm good, thanks! How about you?",
            fromUserId: 2
          },
          {
            messageId: 3,
            createdAt: '2024-03-18T15:00:00.000Z',
            content: "I'm doing well too. Did you see the game last night?",
            fromUserId: 1
          },
          {
            messageId: 4,
            createdAt: '2024-03-20T18:00:00.000Z',
            content: 'Yes, the game was amazing!',
            fromUserId: 2
          },
          {
            messageId: 5,
            createdAt: '2024-03-20T18:00:42.000Z',
            content: 'Who do you think will win the championship?',
            fromUserId: 2
          },
          {
            messageId: 6,
            createdAt: '2024-03-20T18:03:06.000Z',
            content:
              'I think Team A has a good chance. They played exceptionally well in the last few games.',
            fromUserId: 1
          },
          {
            messageId: 7,
            createdAt: '2024-03-20T22:00:06.000Z',
            content: 'We should watch a game together sometime.',
            fromUserId: 1
          },
          {
            messageId: 8,
            createdAt: '2024-03-29T08:00:00.000Z',
            content: "That sounds like a plan. Let's do it!",
            fromUserId: 2
          },
          {
            messageId: 9,
            createdAt: '2024-03-29T08:00:03.000Z',
            content: 'Grateful to have you as a friend!',
            fromUserId: 2
          }
        ]
      },
      {
        conversationId: 2,
        threadId: 3,
        members: [1, 3],
        unseenMessageId: null,
        messages: [
          {
            messageId: 10,
            createdAt: '2024-03-15T10:40:00.000Z',
            content: 'Hey Adam, how have you been?',
            fromUserId: 3
          }
        ]
      },
      {
        conversationId: 3,
        threadId: 5,
        members: [1, 4],
        unseenMessageId: 10,
        messages: [
          {
            messageId: 11,
            createdAt: '2024-03-15T10:25:00.000Z',
            content: 'Do we still have milk?',
            fromUserId: 4
          }
        ]
      }
    ]

    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body).toEqual(expectedResponse)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/api/authed/chats').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

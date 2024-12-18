import request from 'supertest'
import server from '../../../src/app'
import { StatusCodes } from 'http-status-codes'
import generateAuthToken from '../../../src/utils/auth/generateAuthToken'
import prisma from '../../../src/database'

describe('Read Thread', () => {
  it('should successfully read an unseen thread', async () => {
    expect(await isThreadRead(1)).toBe(false)

    const authToken = generateAuthToken(1)
    const res = await request(server)
      .patch('/api/authed/readThread/1')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.OK)
    expect(await isThreadRead(1)).toBe(true)
  })

  it('should successfully read a thread that is already read', async () => {
    expect(await isThreadRead(3)).toBe(true)

    const authToken = generateAuthToken(1)
    const res = await request(server)
      .patch('/api/authed/readThread/1')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.OK)
    expect(await isThreadRead(3)).toBe(true)
  })

  it('should fail to read a nonexistent thread', async () => {
    await expect(isThreadRead(100)).rejects.toThrow('Thread does not exist')

    const authToken = generateAuthToken(1)
    const res = await request(server)
      .patch('/api/authed/readThread/100')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    await expect(isThreadRead(100)).rejects.toThrow('Thread does not exist')
  })

  it('should fail to read a thread that does not belong to the requesting user', async () => {
    await expect(isThreadRead(6)).resolves.not.toThrow()

    const authToken = generateAuthToken(3)
    const res = await request(server)
      .patch('/api/authed/readThread/6')
      .set('Cookie', [`auth-token=${authToken}`])
      .send()

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should fail if user is not logged in', async () => {
    const res = await request(server).get('/api/authed/userHeads').send()
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})

const isThreadRead = async (threadId: number) => {
  const user = await prisma.thread.findUnique({
    where: { id: threadId },
    select: {
      unseenMessageId: true
    }
  })

  if (user == null) {
    throw Error('Thread does not exist')
  }

  return user.unseenMessageId == null
}

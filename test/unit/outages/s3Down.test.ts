import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import server from '@src/app'
import AuthedRequest from '@src/middlewares/authedRequest'
import { getAvatar, getDefaultAvatars } from '@src/storage/s3Accessors'

// Mocking the verifyToken middleware to call next immediately
jest.mock('@src/middlewares/tokenVerification', () => ({
  verifyToken: jest.fn((req, _, next) => {
    ;(req as AuthedRequest<'/api/authed/defaultAvatars', 'get'>).userId = 1
    return next()
  })
}))

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockRejectedValue(new Error('Cannot connect to s3')),
    getSignedUrl: jest.fn().mockRejectedValue(new Error('Cannot connect to s3'))
  })),
  ListObjectsV2Command: jest.fn(),
  GetObjectCommand: jest.fn()
}))

describe('When S3 is down', () => {
  // s3Accessors
  it('getAvatar should throw', async () => {
    await expect(getAvatar('avatar1')).rejects.toThrow()
  })

  it('getDefaultAvatars should throw', async () => {
    await expect(getDefaultAvatars()).rejects.toThrow()
  })

  // Settings routes
  it('get /defaultAvatars should fail with 500', async () => {
    const res = await request(server).get('/api/authed/defaultAvatars').send()
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
  })
})

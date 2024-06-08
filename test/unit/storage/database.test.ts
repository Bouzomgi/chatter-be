import { ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3'
import { getAvatar, getDefaultAvatars } from '../../../src/storage/s3Accessors'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  ListObjectsV2Command: jest.fn(),
  GetObjectCommand: jest.fn()
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn()
}))

beforeEach(() => {
  jest.resetModules() // Reset module registry to avoid interference between tests
  jest.clearAllMocks() // Clear all mocks

  S3Client.prototype.send = jest.fn().mockResolvedValue({
    Contents: [
      {
        Key: 'example.jpg',
        Size: 1024,
        LastModified: new Date('2024-04-24T12:00:00Z')
      },
      {
        Key: 'example2.jpg',
        Size: 2048,
        LastModified: new Date('2024-04-24T12:00:00Z')
      }
    ],
    NextContinuationToken: 'token123',
    IsTruncated: true,
    $metadata: {}
  } as ListObjectsV2CommandOutput)
  ;(getSignedUrl as jest.Mock).mockResolvedValue('mocked-url')
})

describe('getAvatarUrl', () => {
  it('should successfully generate an avatar object', async () => {
    const avatarObject = await getAvatar('example-avatar-1')

    const expectedAvatarObject = { name: 'example-avatar-1', url: 'mocked-url' }

    expect(avatarObject).toEqual(expectedAvatarObject)
  })

  it('should throw if cannot get signed url', () => {
    ;(getSignedUrl as jest.Mock).mockRejectedValueOnce(undefined)

    const avatarObjectPromise = getAvatar('example-avatar-1')

    expect(avatarObjectPromise).rejects.toThrow()
  })
})

describe('getDefaultAvatars', () => {
  it('should successfully get default avatars', async () => {
    const defaultAvatars = await getDefaultAvatars()

    const expectedAvatars = [
      {
        name: 'example.jpg',
        url: 'mocked-url'
      },
      {
        name: 'example2.jpg',
        url: 'mocked-url'
      }
    ]

    expect(defaultAvatars).toEqual(expectedAvatars)
  })

  it('should fail if client call fails', () => {
    S3Client.prototype.send = jest.fn().mockRejectedValueOnce(undefined)

    const avatarPromise = getDefaultAvatars()

    expect(avatarPromise).rejects.toThrow()
  })
})

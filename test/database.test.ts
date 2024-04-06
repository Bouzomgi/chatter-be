import * as awsSdkClientS3 from '@aws-sdk/client-s3'
import { ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3'
import { getDefaultAvatars } from '../src/storage/s3Accessors'

const s3ClientSpy = jest.spyOn(awsSdkClientS3, 'S3Client')

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  ListObjectsV2Command: jest.fn()
}))

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

describe('getDefaultAvatars', () => {
  it('should create an S3 client on first call', async () => {
    const defaultAvatars = await getDefaultAvatars()

    expect(s3ClientSpy).toHaveBeenCalled()

    expect(defaultAvatars).toEqual(['example.jpg', 'example2.jpg'])
  })

  it('should use the previously created S3 client on subsequent calls', async () => {
    await getDefaultAvatars()

    expect(s3ClientSpy).not.toHaveBeenCalled()
  })
})

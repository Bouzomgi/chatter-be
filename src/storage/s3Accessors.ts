import env from '../config'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

let client: S3Client | null = null

function getS3Client() {
  if (client === null) {
    client = new S3Client({
      region: env.AWS_DEFAULT_REGION,
      endpoint: env.AWS_S3_ENDPOINT,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    })
  }
  return client
}

export async function getDefaultAvatars() {
  const input = {
    Bucket: env.STORAGE_BUCKET_NAME,
    Delimiter: '/',
    Prefix: 'avatars/default/'
  }

  const client = getS3Client()
  const command = new ListObjectsV2Command(input)
  const listOutput = await client.send(command)
  return listOutput.Contents!.map((elem) => elem.Key!)
}

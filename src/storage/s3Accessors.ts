import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '@src/config'

const clientOptions = env.AWS_S3_ENDPOINT
  ? {
      region: env.AWS_DEFAULT_REGION,
      endpoint: env.AWS_S3_ENDPOINT,
      credentials: {
        accessKeyId: 'localstack',
        secretAccessKey: 'localstack'
      }
    }
  : { region: env.AWS_DEFAULT_REGION }

const client = new S3Client(clientOptions)

// Takes in an avatar name
export async function getAvatar(avatar: string) {
  const getObjectParams = {
    Bucket: env.STORAGE_BUCKET_NAME,
    Key: avatar
  }

  try {
    const bucketObject = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(client, bucketObject, {
      expiresIn: 60
    })
    return { name: avatar, url }
  } catch {
    throw new Error('failed to generate avatar url')
  }
}

export async function getDefaultAvatars() {
  const input = {
    Bucket: env.STORAGE_BUCKET_NAME,
    Delimiter: '/',
    Prefix: 'avatars/default/'
  }

  try {
    const command = new ListObjectsV2Command(input)
    const listOutput = await client.send(command)
    const avatarNameList = listOutput.Contents!.map((elem) => elem.Key!)
    const avatarList = avatarNameList.map((avatar) => getAvatar(avatar))
    return await Promise.all(avatarList)
  } catch {
    throw new Error('failed to get default avatars')
  }
}

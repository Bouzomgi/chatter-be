import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import env from '@src/config'
import { s3Client, signedUrlClient } from './clients'

// Takes in an avatar name
export async function getAvatar(avatar: string) {
  const getObjectParams = {
    Bucket: env.STORAGE_BUCKET_NAME,
    Key: avatar
  }

  try {
    const bucketObject = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(signedUrlClient, bucketObject, {
      expiresIn: 60
    })
    return { name: avatar, url }
  } catch (error) {
    console.error('failed to generate avatar url')
    throw error
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
    const listOutput = await s3Client.send(command)
    const avatarNameList = listOutput.Contents!.map((elem) => elem.Key!)
    const avatarList = avatarNameList.map((avatar) => getAvatar(avatar))
    return await Promise.all(avatarList)
  } catch (error) {
    console.error('failed to get default avatars')
    throw error
  }
}

import { S3Client } from '@aws-sdk/client-s3'
import env from '@src/config'

const clientOptions = env.AWS_S3_ENDPOINT
  ? {
      region: env.AWS_DEFAULT_REGION,
      endpoint: env.AWS_S3_ENDPOINT,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      },
      forcePathStyle: true
    }
  : {
      region: env.AWS_DEFAULT_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
      }
    }

// https://github.com/localstack/localstack/issues/6301#issuecomment-1560171249
const signedUrlClientOptions = env.AWS_S3_URL_SIGNER_ENDPOINT
  ? { ...clientOptions, endpoint: env.AWS_S3_URL_SIGNER_ENDPOINT }
  : clientOptions

const s3Client = new S3Client(clientOptions)
const signedUrlClient = new S3Client(signedUrlClientOptions)

export { s3Client, signedUrlClient }

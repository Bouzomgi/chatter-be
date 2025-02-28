import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
  PORT: num(),
  DATABASE_URL: str(),
  STORAGE_BUCKET_NAME: str(),
  FRONTEND_ENDPOINT: str(),

  AWS_S3_ENDPOINT: str({ default: '' }),
  AWS_S3_URL_SIGNER_ENDPOINT: str({ default: '' }),

  AWS_USERNAME: str(),
  AWS_PASSWORD: str(),
  AWS_DEFAULT_REGION: str(),

  TOKEN_SECRET: str()
})

export default env

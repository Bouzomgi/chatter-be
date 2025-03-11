import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
  PORT: num(),
  DATABASE_URL: str(),
  STORAGE_BUCKET_NAME: str(),
  FRONTEND_ENDPOINTS: str(),

  AWS_S3_ENDPOINT: str({ default: '' }),
  AWS_S3_URL_SIGNER_ENDPOINT: str({ default: '' }),

  AWS_DEFAULT_REGION: str(),
  AWS_ACCESS_KEY_ID: str({ default: '' }),
  AWS_SECRET_ACCESS_KEY: str({ default: '' }),

  TOKEN_SECRET: str()
})

export default env

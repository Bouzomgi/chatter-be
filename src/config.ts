import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
  PORT: num(),
  DATABASE_URL: str(),
  STORAGE_BUCKET_NAME: str(),

  AWS_S3_ENDPOINT: str(),
  AWS_DEFAULT_REGION: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),

  TOKEN_SECRET: str()
})

export default env

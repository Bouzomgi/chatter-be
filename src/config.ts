import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
  PORT: num(),
  DATABASE_URL: str(),
  STORAGE_BUCKET_NAME: str(),

  S3_ENDPOINT: str(),
  DEFAULT_REGION: str(),
  ACCESS_KEY_ID: str(),
  SECRET_ACCESS_KEY: str(),

  TOKEN_SECRET: str()
})

export default env

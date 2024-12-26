import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),

  PORT: num(),
  DATABASE_URL: str(),
  STORAGE_BUCKET_NAME: str(),

  AWS_S3_ENDPOINT: str({ default: '' }),
  AWS_DEFAULT_REGION: str(),

  TOKEN_SECRET: str()
})

export default env

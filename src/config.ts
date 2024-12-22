import { cleanEnv, num, str } from 'envalid'

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),

  PORT: num(),
  DATABASE_URL: str(),
  STORAGE_BUCKET_NAME: str(),

  AWS_S3_ENDPOINT: str({ default: '' }),
  AWS_DEFAULT_REGION: str(),

  TOKEN_SECRET: str(),

  // Acceptance tests
  TESTING_PORT: num(),
  TESTING_HTTP_ENDPOINT: str(),
  TESTING_WS_ENDPOINT: str(),
  SERVICE_ACCOUNT_USERNAME: str(),
  SERVICE_ACCOUNT_PASSWORD: str()
})

export default env

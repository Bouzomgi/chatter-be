import { cleanEnv, str } from 'envalid'

const prismaEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  DATABASE_URL: str(),
  SERVICE_ACCOUNT_USERNAME: str(),
  SERVICE_ACCOUNT_PASSWORD: str()
})

export default prismaEnv

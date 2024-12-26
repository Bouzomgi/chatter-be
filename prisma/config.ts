import { cleanEnv, str } from 'envalid'

const prismaEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] })
})

export default prismaEnv

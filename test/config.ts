import { cleanEnv, str, num } from 'envalid'

const testEnv = cleanEnv(process.env, {
  // Acceptance tests
  TESTING_HTTP_ENDPOINT: str(),
  TESTING_WS_ENDPOINT: str(),
  SERVICE_ACCOUNT_USERNAME: str(),
  SERVICE_ACCOUNT_PASSWORD: str()
})

export default testEnv

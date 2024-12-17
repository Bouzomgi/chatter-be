import { SuperTest, Test } from 'supertest'
import { Server } from 'http'
import Cookie from 'cookiejar'

// Declaring the 'supertest-session' module
declare module 'supertest-session' {
  // Define the Session class that extends SuperTest
  export class Session extends SuperTest<Test> {
    cookies: Cookie[]
    reset(): void
    destroy(): void
    request(method: string, route: string): Test
  }

  // Export createSession as the default function
  export default function createSession(app: Server, options?: object): Session
}

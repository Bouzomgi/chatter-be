import env from '@src/config'
import {
  extractCookies,
  getAuthToken,
  setCookies
} from '@test/testHelpers/axiosCookieInterceptors'
import isS3SignedUrlValid from '@test/testHelpers/checkSignedUrl'
import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import WebSocket from 'ws'

const apiClient = axios.create()
apiClient.interceptors.request.use(setCookies)
apiClient.interceptors.response.use(extractCookies)

/*
  A basic non-disruptive user flow intended to test the server as it is serving requests
*/
describe('Basic flow', () => {
  const httpUrl = `${env.TESTING_HTTP_ENDPOINT}:${env.TESTING_PORT}`
  const wsUrl = `${env.TESTING_WS_ENDPOINT}:${env.TESTING_PORT}`

  it('should block an unauthorized /authed route request', async () => {
    const res = await apiClient
      .get(`${httpUrl}/api/authed/chats`)
      .catch((err) => err.response)

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  it('should block an unauthorized WebSocket request', (done) => {
    testUnauthorizedWebSocket(done)
  })

  it('should login to service account', async () => {
    const req = {
      username: env.SERVICE_ACCOUNT_USERNAME,
      password: env.SERVICE_ACCOUNT_PASSWORD
    }
    const res = await apiClient
      .post(`${httpUrl}/api/login`, req)
      .catch((err) => err.response)

    expect(res.status).toBe(StatusCodes.OK)
  })

  it('should allow fetching of chats', async () => {
    const res = await apiClient
      .get(`${httpUrl}/api/authed/chats`)
      .catch((err) => err.response)

    expect(res.status).toBe(StatusCodes.OK)
  })

  it('should be able to fetch avatar', async () => {
    const res = await apiClient
      .get(`${httpUrl}/api/authed/avatar`)
      .catch((err) => err.response)

    expect(res.status).toBe(StatusCodes.OK)
    expect(res.data).toHaveProperty('avatar')
    expect(res.data).toHaveProperty('url')

    const { url } = res.data
    expect(isS3SignedUrlValid(url)).toBe(true)
  })

  it('should allow an authorized websocket request', (done) => {
    const socket = createWebSocket()

    socket.onopen = () => {
      expect(socket.readyState).toBe(WebSocket.OPEN)
      socket.close()
      done()
    }

    socket.onerror = () => {
      done(new Error('WebSocket connection failed to open'))
    }
  })

  it('should properly logout', async () => {
    const res = await apiClient
      .post(`${httpUrl}/api/logout`)
      .catch((err) => err.response)

    expect(res.status).toBe(StatusCodes.OK)
  })

  it('should block an unauthorized WebSocket request', (done) => {
    testUnauthorizedWebSocket(done)
  })

  // Helpers
  const createWebSocket = () => {
    const authToken = getAuthToken()

    const socket = authToken
      ? new WebSocket(wsUrl, {
          headers: {
            Cookie: `auth-token=${authToken}`
          }
        })
      : new WebSocket(wsUrl)

    return socket
  }

  const testUnauthorizedWebSocket = (done: jest.DoneCallback) => {
    const socket = createWebSocket()

    socket.onopen = () => {
      socket.close()
      done(new Error('WebSocket connection should not have been opened'))
    }

    socket.onerror = (err) => {
      socket.close()
      expect(err).toBeDefined()
      done()
    }
  }
})

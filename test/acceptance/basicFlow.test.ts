import env from '@src/config'
import testEnv from '@test/config'
import {
  extractCookies,
  getAuthToken,
  setCookies
} from '@test/testHelpers/axiosCookieInterceptors'
import isS3SignedUrlValid from '@test/testHelpers/checkSignedUrl'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { StatusCodes } from 'http-status-codes'
import WebSocket from 'ws'

const apiClient = axios.create()
apiClient.interceptors.request.use(setCookies)
apiClient.interceptors.response.use(extractCookies)

/*
  A basic non-disruptive user flow intended to test the server as it is serving requests
*/
describe('Basic flow', () => {
  const httpUrl = `${testEnv.TESTING_HTTP_ENDPOINT}:${env.PORT}`
  const wsUrl = `${testEnv.TESTING_WS_ENDPOINT}:${env.PORT}`

  it('should respond to a health check', async () => {
    try {
      const res = await apiClient.get(`${httpUrl}/api/health`)
      expect(res.status).toBe(StatusCodes.OK)
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      } else {
        expect(axiosError.response?.status).toBe(StatusCodes.OK)
      }
    }
  })

  it('should block an unauthorized /authed route request', async () => {
    try {
      await apiClient.get(`${httpUrl}/api/authed/chats`)
      throw new Error(
        'Request should not have succeeded. Expected Unauthorized error (401).'
      )
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      }

      expect(axiosError.response?.status).toBe(StatusCodes.UNAUTHORIZED)
    }
  })

  it('should block an unauthorized WebSocket request', (done) => {
    testUnauthorizedWebSocket(done)
  })

  it('should login to service account', async () => {
    try {
      const req = {
        username: testEnv.SERVICE_ACCOUNT_USERNAME,
        password: testEnv.SERVICE_ACCOUNT_PASSWORD
      }

      const res = await apiClient.post(`${httpUrl}/api/login`, req)
      expect(res.status).toBe(StatusCodes.OK)
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      }

      expect(axiosError.response?.status).toBe(StatusCodes.OK)
    }
  })

  it('should allow fetching of chats', async () => {
    try {
      const res = await apiClient.get(`${httpUrl}/api/authed/chats`)

      expect(res.status).toBe(StatusCodes.OK)
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      }

      expect(axiosError.response?.status).toBe(StatusCodes.OK)
    }
  })

  it('should be able to fetch default avatars', async () => {
    let res: AxiosResponse

    try {
      res = await apiClient.get(`${httpUrl}/api/authed/defaultAvatars`)
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      }

      expect(axiosError.response?.status).toBe(StatusCodes.OK)
      fail()
    }

    expect(res.status).toBe(StatusCodes.OK)

    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBeGreaterThan(0)

    const firstAvatar = res.data[0]
    expect(firstAvatar).toHaveProperty('name')
    expect(firstAvatar).toHaveProperty('url')

    const { url } = firstAvatar
    expect(await isS3SignedUrlValid(url)).toBe(true)
  })

  it('should allow an authorized websocket request', (done) => {
    const socket = createWebSocket()

    socket.onopen = () => {
      expect(socket.readyState).toBe(WebSocket.OPEN)
      socket.close()
      done()
    }

    socket.onerror = (error) => {
      if (error.error.code.includes('ECONNREFUSED')) {
        // This error happens if the WebSocket URL does not exist or the server is not available
        done(
          new Error(
            'Connection error: The WebSocket server is down or unreachable.'
          )
        )
      } else {
        done(new Error('WebSocket connection failed to open'))
      }
    }
  })

  it('should properly logout', async () => {
    try {
      const res = await apiClient.post(`${httpUrl}/api/logout`)
      expect(res.status).toBe(StatusCodes.OK)
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      }
      expect(axiosError.response?.status).toBe(StatusCodes.OK)
    }
  })

  it('should block an unauthorized /authed route request', async () => {
    try {
      await apiClient.get(`${httpUrl}/api/authed/chats`)
      throw new Error(
        'Request should not have succeeded. Expected Unauthorized error (401).'
      )
    } catch (error) {
      const axiosError = error as AxiosError

      if (axiosError.code === 'ECONNREFUSED') {
        throw new Error(
          'The server is not running. Please start the server before running the tests'
        )
      }

      expect(axiosError.response?.status).toBe(StatusCodes.UNAUTHORIZED)
    }
  })

  it('should block an unauthorized WebSocket request', (done) => {
    testUnauthorizedWebSocket(done)
  })

  // Helpers
  const createWebSocket = () => {
    const wsAuthedEndpoint = `${wsUrl}/api/authed/`
    const authToken = getAuthToken()

    const socket = authToken
      ? new WebSocket(wsAuthedEndpoint, {
          headers: {
            Cookie: `auth-token=${authToken}`
          }
        })
      : new WebSocket(wsAuthedEndpoint)

    return socket
  }

  // need to make sure the failure is from a 401 and not a "could not connect"
  const testUnauthorizedWebSocket = (done: jest.DoneCallback) => {
    const socket = createWebSocket()

    socket.onopen = () => {
      socket.close()
      done(new Error('WebSocket connection should not have been opened'))
    }

    socket.onerror = (error) => {
      socket.close()
      if (error?.error?.code?.includes('ECONNREFUSED')) {
        // This error happens if the WebSocket URL does not exist or the server is not available
        done(
          new Error(
            'Connection error: The WebSocket server is down or unreachable.'
          )
        )
      } else {
        expect(error).toBeDefined()
        done()
      }
    }
  }
})

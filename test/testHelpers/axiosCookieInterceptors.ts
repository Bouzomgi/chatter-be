import { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// A record to store cookies
const cookies: Record<string, string> = {}

// Request interceptor: Sets cookies into the request headers
const setCookies = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  if (Object.keys(cookies).length) {
    // Format cookies string, e.g "session=xxyyzz; token=123"
    const cookiesStr = Object.keys(cookies)
      .map((key) => `${key}=${cookies[key]}`)
      .join('; ')

    // Ensure headers are an object before adding cookies
    config.headers = config.headers || {}
    config.headers['Cookie'] = cookiesStr
  }
  return config
}

// Response interceptor: Extracts cookies from response headers and stores them
const extractCookies = (response: AxiosResponse): AxiosResponse => {
  const setCookieHeader = response.headers['set-cookie']

  if (setCookieHeader) {
    setCookieHeader.forEach((cookie: string) => {
      // Handling cookie splitting and extracting the key-value pair
      const [key, value] = cookie.split(';')[0].split('=')
      cookies[key] = value
    })
  }
  return response
}

const getAuthToken = () => cookies['auth-token']

export { setCookies, extractCookies, getAuthToken }

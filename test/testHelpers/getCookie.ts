import { Response } from 'supertest'
import { parse } from 'cookie'

const getCookieValue = (response: Response, cookieName: string) => {
  const allCookies = response.headers['set-cookie']

  if (!Array.isArray(allCookies)) {
    return undefined
  }

  const allCookiesArray = allCookies as unknown as string[]

  const wantedCookie = allCookiesArray.find((cookieString: string) =>
    cookieString.startsWith(`${cookieName}=`)
  )

  if (wantedCookie == undefined) return undefined

  const parsedCookie = parse(wantedCookie)
  return parsedCookie[cookieName]
}

export default getCookieValue

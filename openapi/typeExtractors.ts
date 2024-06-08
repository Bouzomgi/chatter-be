import { paths } from './schema'

// PARAMETERS

/* 
  Can extract route parameters from a given path and method in the schema data model
    type RegisterRouteParams = ExtractRouteParameters<'/readThread/{threadId}', 'get'>;
      has type
    { threadId: number } 
*/
export type ExtractRouteParameters<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = paths[Path][Method] extends { parameters: { path: infer Params } }
  ? Params
  : never

// REQUESTS

/* 
  Can extract request bodies from a given path in the schema data model
    type RegisterRequestBody = ExtractPathRequestBody<'/register', 'post'>;
      has type
    { email: string, username: string, password: string } 
*/
export type ExtractPathRequestBody<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paths[Path][Method] extends { requestBody: any }
    ? paths[Path][Method]['requestBody']['content']['application/json']
    : never

// RESPONSES

type ExtractResponseContent<T> = T extends {
  content: { 'application/json': infer R }
}
  ? R
  : never
type ExtractResponses<T> = T extends { responses: infer R }
  ? {
      [K in keyof R]: ExtractResponseContent<R[K]>
    }[keyof R]
  : never

type NonUndefined<T> = T extends undefined ? never : T

/* 
  Can extract a union type of all response bodies from a given path in the schema data model
    type RegisterResponseBodies = ExtractPathResponsesBodies<paths['/register']>;
      has type
    { message: string } | { error: string }
*/
export type ExtractPathResponseBodies<Path extends keyof paths> = NonUndefined<
  {
    [Method in keyof paths[Path]]: ExtractResponses<paths[Path][Method]>
  }[keyof paths[Path]]
>

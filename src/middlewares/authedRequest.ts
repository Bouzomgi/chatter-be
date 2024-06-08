import { Request } from 'express'
import { Query } from 'express-serve-static-core'
import {
  ExtractRouteParameters,
  ExtractPathRequestBody,
  ExtractPathResponseBodies
} from '../../openapi/typeExtractors'
import { paths } from '../../openapi/schema'

export default interface AuthedRequest<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> extends Request<
    ExtractRouteParameters<Path, Method>,
    ExtractPathResponseBodies<Path>,
    ExtractPathRequestBody<Path, Method>,
    Query
  > {
  userId: number
}

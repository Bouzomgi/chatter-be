import { Request } from 'express'
import { Query } from 'express-serve-static-core'
import { paths } from '../../openapi/schema'
import {
  ExtractPathRequestBody,
  ExtractPathResponseBodies,
  ExtractRouteParameters
} from '../../openapi/typeExtractors'

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

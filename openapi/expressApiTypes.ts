import { Request, Response } from 'express'
import { Query } from 'express-serve-static-core'
import { paths } from './schema'
import {
  ExtractPathRequestBody,
  ExtractPathResponseBodies,
  ExtractRouteParameters
} from './typeExtractors'

export type PathMethodRequest<
  Path extends keyof paths,
  Method extends keyof paths[Path]
> = Request<
  ExtractRouteParameters<Path, Method>,
  ExtractPathResponseBodies<Path>,
  ExtractPathRequestBody<Path, Method>,
  Query
>

export type PathMethodResponse<Path extends keyof paths> = Response<
  ExtractPathResponseBodies<Path>
>

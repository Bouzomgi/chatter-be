import { Request, Response } from 'express'
import { Query } from 'express-serve-static-core'
import {
  ExtractRouteParameters,
  ExtractPathRequestBody,
  ExtractPathResponseBodies
} from './typeExtractors'
import { paths } from './schema'

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

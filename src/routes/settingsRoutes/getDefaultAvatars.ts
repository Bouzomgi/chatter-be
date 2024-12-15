import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import { getDefaultAvatars } from '../../storage/s3Accessors'

const router = express.Router()

router.get(
  '/defaultAvatars',
  async (
    req: PathMethodRequest<'/api/authed/defaultAvatars', 'get'>,
    res: PathMethodResponse<'/api/authed/defaultAvatars'>
  ) => {
    try {
      const defaultAvatars = await getDefaultAvatars()

      return res.status(StatusCodes.OK).json({
        defaultAvatars
      })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get default' })
    }
  }
)

export default router

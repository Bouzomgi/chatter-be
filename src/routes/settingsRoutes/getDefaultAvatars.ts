import { PathMethodRequest, PathMethodResponse } from '@openapi/expressApiTypes'
import { getDefaultAvatars } from '@src/storage/s3Accessors'
import express from 'express'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

router.get(
  '/defaultAvatars',
  async (
    req: PathMethodRequest<'/api/authed/defaultAvatars', 'get'>,
    res: PathMethodResponse<'/api/authed/defaultAvatars'>
  ) => {
    try {
      const defaultAvatars = await getDefaultAvatars()

      return res.status(StatusCodes.OK).send(defaultAvatars)
    } catch (error) {
      console.error(`get /defaultAvatars error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not get default avatars' })
    }
  }
)

export default router

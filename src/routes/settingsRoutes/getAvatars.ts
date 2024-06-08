import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import AuthedRequest from '../../middlewares/authedRequest'
import { getDefaultAvatars } from '../../storage/s3Accessors'

const router = express.Router()

router.get(
  '/avatars',
  async (
    req: PathMethodRequest<'/authed/avatars', 'get'>,
    res: PathMethodResponse<'/authed/avatars'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/avatars', 'get'>

      const defaultAvatars = await getDefaultAvatars()

      const userProfile = await prisma.profile.findUnique({
        where: {
          userId: authedReq.userId
        }
      })

      if (userProfile === null) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Could not find user profile' })
      }

      return res.status(StatusCodes.OK).json({
        defaultAvatars,
        currentAvatar: userProfile.avatar
      })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not change avatar' })
    }
  }
)

export default router

import { getDefaultAvatars } from '@src/storage/s3Accessors'
import express from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import prisma from '../../database'
import AuthedRequest from '../../middlewares/authedRequest'

const router = express.Router()

router.post(
  '/setSettings',
  checkSchema({
    avatar: { in: ['body'], notEmpty: true }
  }),
  async (
    req: PathMethodRequest<'/authed/setSettings', 'post'>,
    res: PathMethodResponse<'/authed/setSettings'>
  ) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.error('post /setSettings validation failed:', errors.array())
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Could not set settings' })
      }

      const authedReq = req as AuthedRequest<'/authed/setSettings', 'post'>

      if (req.body.avatar) {
        const defaultAvatarNames = (await getDefaultAvatars()).map(
          (avatar) => avatar.name
        )

        const strippedAvatarName = stripLeadingDotSlash(req.body.avatar)

        if (!defaultAvatarNames.includes(strippedAvatarName)) {
          return res
            .status(StatusCodes.NOT_FOUND)
            .json({ message: 'Could not find avatar' })
        }

        await prisma.profile.update({
          where: {
            userId: authedReq.userId
          },
          data: {
            avatar: req.body.avatar
          }
        })
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: 'Successfully changed settings' })
    } catch (error) {
      console.error(`post /setSettings error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not change settings' })
    }
  }
)

const stripLeadingDotSlash = (input: string) => {
  if (input.startsWith('./')) {
    return input.slice(2)
  }
  return input
}

export default router

import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../database'
import { AuthedRequest } from '../middlewares/tokenVerification'
import { checkSchema, validationResult } from 'express-validator'
import { getDefaultAvatars } from '../storage/s3Accessors'

const router = express.Router()

// TODO: make sure that the avatar is actually an avatar... not just like, random code
// I think i can make a call to the BE, find all avatars, and store this so i dont keep making this req
router.post(
  '/setAvatar',
  checkSchema({
    avatar: { in: ['body'], notEmpty: true }
  }),
  async (req: Request, res: Response) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as AuthedRequest

      const defaultAvatars = await getDefaultAvatars()
      if (!defaultAvatars.includes(req.body.avatar)) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Could not find avatar' })
      }

      await prisma.profile.update({
        where: {
          id: authedReq.userId
        },
        data: {
          avatar: req.body.avatar
        }
      })
      return res
        .status(StatusCodes.OK)
        .json({ message: 'Successfully changed avatar' })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not change avatar' })
    }
  }
)

export default router

import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import bcrypt from 'bcryptjs'
import { checkSchema, validationResult } from 'express-validator'
import { getAvatar } from '../../storage/s3Accessors'
import generateAuthToken from '../../utils/generateAuthToken'

const router = express.Router()

router.post(
  '/login',
  checkSchema({
    username: {
      in: ['body'],
      trim: true,
      notEmpty: true,
      toLowerCase: true,
      matches: {
        options: /^[A-Za-z0-9_-]+$/,
        errorMessage:
          'Username must only contain letters, numbers, underscores, and dashes.'
      }
    },
    password: { in: ['body'], notEmpty: true }
  }),
  async (
    req: PathMethodRequest<'/api/login', 'post'>,
    res: PathMethodResponse<'/api/login'>
  ) => {
    try {
      await validationResult(req).throw()

      const existingProfile = await prisma.profile.findUnique({
        where: {
          username: req.body.username
        },
        include: {
          user: true
        }
      })

      if (existingProfile == null) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Invalid login attempt' })
      }
      const existingUser = existingProfile.user

      const validPass = await bcrypt.compare(
        req.body.password,
        existingUser.password
      )

      if (!validPass) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Invalid login attempt' })
      }

      const userAvatar = await getAvatar(existingProfile.avatar)

      // CREATE AND ASSIGN A TOKEN
      const token = generateAuthToken(existingUser!.id)

      return res
        .status(StatusCodes.OK)
        .cookie('auth-token', token, {
          httpOnly: true,
          secure: false, // switch
          sameSite: 'lax' // Allows the cookie to be sent from a different origin (cross-origin requests)
        })
        .json({
          userId: existingUser.id,
          username: existingProfile.username,
          avatar: userAvatar
        })
    } catch (error) {
      console.error(`post /login error: ${error}`)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not login' })
    }
  }
)

export default router

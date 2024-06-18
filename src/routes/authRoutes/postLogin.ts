import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import env from '../../config'
import { checkSchema, validationResult } from 'express-validator'
import { getAvatar } from '../../storage/s3Accessors'

const router = express.Router()

// modify to return username, userId, avatarURL

router.post(
  '/login',
  checkSchema({
    username: { in: ['body'], trim: true, notEmpty: true, toLowerCase: true },
    password: { in: ['body'], notEmpty: true }
  }),
  async (
    req: PathMethodRequest<'/login', 'post'>,
    res: PathMethodResponse<'/login'>
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

      if (existingProfile === null) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Username is not recognized' })
      }

      const existingUser = existingProfile.user

      const validPass = await bcrypt.compare(
        req.body.password,
        existingUser.password
      )

      if (!validPass) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Invalid password' })
      }

      const userAvatar = await getAvatar(existingProfile.avatar)

      // CREATE AND ASSIGN A TOKEN
      const token = await jwt.sign(
        {
          userId: existingUser!.id
        },
        env.TOKEN_SECRET,
        { expiresIn: '30h' }
      )

      return res
        .status(StatusCodes.OK)
        .cookie('auth-token', token, {
          httpOnly: true,
          secure: false, // switch
          sameSite: 'none' // Allows the cookie to be sent from a different origin (cross-origin requests)
        })
        .json({
          userId: existingUser.id,
          username: existingProfile.username,
          avatar: userAvatar
        })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not login' })
    }
  }
)

export default router

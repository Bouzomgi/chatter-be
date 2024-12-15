import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '../../config'
import { checkSchema, validationResult } from 'express-validator'
import { getAvatar } from '../../storage/s3Accessors'

const router = express.Router()

router.post(
  '/login',
  checkSchema({
    username: { in: ['body'], trim: true, notEmpty: true, toLowerCase: true },
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
      console.log(existingProfile)

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
          sameSite: 'lax' // Allows the cookie to be sent from a different origin (cross-origin requests)
        })
        .json({
          userId: existingUser.id,
          username: existingProfile.username,
          avatar: userAvatar
        })
    } catch (error) {
      if (error instanceof Error) {
        console.error('Login failed:', {
          message: error?.message || 'Unknown error',
          stack: error?.stack || 'No stack trace'
        })
      } else {
        console.error('Login failed with unknown error:')
      }
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not login' })
    }
  }
)

export default router

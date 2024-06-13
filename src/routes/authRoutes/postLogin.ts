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

const router = express.Router()

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
          httpOnly: false,
          secure: true, // switch
          sameSite: 'none' // Allows the cookie to be sent from a different origin (cross-origin requests)
        })
        .json({
          message: 'Logged in'
        })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not login' })
    }
  }
)

export default router

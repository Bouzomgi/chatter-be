import hashPassword from '@src/utils/hashPassword'
import express from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { getDefaultAvatars } from '../../storage/s3Accessors'
import prisma from './../../database'

const router = express.Router()

router.post(
  '/register',
  checkSchema({
    email: {
      in: ['body'],
      isEmail: true,
      trim: true,
      notEmpty: true,
      toLowerCase: true
    },
    username: { in: ['body'], trim: true, notEmpty: true, toLowerCase: true },
    password: {
      in: ['body'],
      isLength: { options: { min: 5 } },
      notEmpty: true,
      custom: {
        options: (value) => !/\s/.test(value), // Check if password contains any whitespace
        errorMessage: 'Password must not contain spaces'
      }
    }
  }),
  async (
    req: PathMethodRequest<'/api/register', 'post'>,
    res: PathMethodResponse<'/api/register'>
  ) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.error('post /register validation failed:', errors.array())
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Could not register' })
      }

      const emailExists = await prisma.user.findFirst({
        where: {
          email: req.body.email
        }
      })

      if (emailExists != null) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: 'Email is already in use' })
      }

      const usernameExists = await prisma.profile.findFirst({
        where: {
          username: req.body.username
        }
      })

      if (usernameExists != null) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ error: 'Username is already in use' })
      }

      // HASH PASSWORD
      const hashedPassword = await hashPassword(req.body.password)

      const defaultAvatars = await getDefaultAvatars()

      const randomIndex = Math.floor(Math.random() * defaultAvatars.length)
      const randomAvatar = defaultAvatars[randomIndex]

      // CREATE THE USER AND PROFILE
      await prisma.user.create({
        data: {
          email: req.body.email,
          password: hashedPassword,
          profile: {
            create: {
              username: req.body.username,
              avatar: randomAvatar.name
            }
          }
        }
      })

      return res
        .status(StatusCodes.CREATED)
        .json({ message: 'Successfully created user' })
    } catch (error) {
      console.error(`post /register error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not register' })
    }
  }
)

export default router

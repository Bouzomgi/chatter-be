import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../database'
import bcrypt from 'bcrypt'
import { getDefaultAvatars } from '../storage/s3Accessors'
import jwt from 'jsonwebtoken'
import env from '../config'
import { checkSchema, validationResult } from 'express-validator'

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
  async (req: Request, res: Response) => {
    try {
      await validationResult(req).throw()

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

      const usernameExists = await prisma.user.findFirst({
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
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(req.body.password, salt)

      const defaultAvatars = await getDefaultAvatars()

      if (defaultAvatars == undefined) {
        throw new Error('S3 bucket avatars do not exist')
      }

      const randomIndex = Math.floor(Math.random() * defaultAvatars.length)
      const randomAvatar = defaultAvatars[randomIndex]

      // CREATE THE USER AND PROFILE
      await prisma.user.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          password: hashedPassword,
          profile: {
            create: {
              avatar: randomAvatar
            }
          }
        }
      })

      return res
        .status(StatusCodes.CREATED)
        .json({ message: 'Successfully created user' })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not register' })
    }
  }
)

router.post(
  '/login',
  checkSchema({
    username: { in: ['body'], trim: true, notEmpty: true, toLowerCase: true },
    password: { in: ['body'], notEmpty: true }
  }),
  async (req: Request, res: Response) => {
    try {
      await validationResult(req).throw()

      const existingUser = await prisma.user.findUnique({
        where: {
          username: req.body.username
        }
      })

      if (existingUser === null) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Username is not recognized' })
      }

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
          httpOnly: true,
          secure: false, // switch
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

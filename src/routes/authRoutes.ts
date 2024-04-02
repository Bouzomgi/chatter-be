import express from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../database'
import bcrypt from 'bcrypt'
import { getDefaultAvatars } from '../storage/s3Accessors'
import jwt from 'jsonwebtoken'
import env from '../config'
// import { checkSchema, validationResult } from 'express-validator'

const router = express.Router()

// TODO: validation with zod
router.post('/register', async (req, res) => {
  try {
    const email = req.body.email.toLowerCase()
    const username = req.body.username.toLowerCase()
    const { password } = req.body

    const emailExists = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (emailExists != null) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: 'Email is already in use' })
    }

    const usernameExists = await prisma.user.findFirst({
      where: {
        username: username
      }
    })

    if (usernameExists != null) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ error: 'Username is already in use' })
    }

    // HASH PASSWORD
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const defaultAvatars = await getDefaultAvatars()

    if (defaultAvatars == undefined) {
      throw new Error('S3 bucket avatars do not exist')
    }

    const randomIndex = Math.floor(Math.random() * defaultAvatars.length)
    const randomAvatar = defaultAvatars[randomIndex]

    // CREATE THE USER AND PROFILE
    await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        profile: {
          create: {
            avatar: randomAvatar
          }
        }
      }
    })

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully created user' })
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not register' })
  }
})

// TODO: validation with zod
router.post('/login', async (req, res) => {
  try {
    const username = req.body.username.toLowerCase()
    const { password } = req.body

    const existingUser = await prisma.user.findUnique({
      where: {
        username: username
      }
    })

    if (existingUser === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'Username is not recognized' })
    }

    const validPass = await bcrypt.compare(password, existingUser.password)

    if (!validPass) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: 'Invalid password' })
    }

    // CREATE AND ASSIGN A TOKEN
    const token = jwt.sign(
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
  } catch (error) {
    console.log(error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not login' })
  }
})

export default router

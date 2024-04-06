import express from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../database'
import { AuthedRequest } from '../middlewares/tokenVerification'

const router = express.Router()

// TODO: validation with zod
router.post('/setAvatar', async (req, res) => {
  try {
    const authedReq = req as AuthedRequest
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
})

export default router

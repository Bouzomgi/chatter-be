import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import AuthedRequest from '../../middlewares/authedRequest'

const router = express.Router()

router.get(
  '/userHeads',
  async (
    req: PathMethodRequest<'/authed/userHeads', 'get'>,
    res: PathMethodResponse<'/authed/userHeads'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/chatheads', 'get'>

      const users = await prisma.user.findMany({
        where: {
          NOT: {
            id: authedReq.userId
          }
        },
        include: { profile: true }
      })

      const userHeads = users.map((user) => {
        const { profile, ...rest } = user
        return {
          avatar: profile!.avatar,
          userId: rest.id,
          username: rest.username
        }
      })

      return res.status(StatusCodes.OK).json(userHeads)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get users' })
    }
  }
)

export default router

import { PathMethodRequest, PathMethodResponse } from '@openapi/expressApiTypes'
import { components } from '@openapi/schema'
import prisma from '@src/database'
import AuthedRequest from '@src/middlewares/authedRequest'
import { getAvatar } from '@src/storage/s3Accessors'
import express from 'express'
import { StatusCodes } from 'http-status-codes'

type Userhead = components['schemas']['UserDetails']

const router = express.Router()

router.get(
  '/userHeads',
  async (
    req: PathMethodRequest<'/authed/userHeads', 'get'>,
    res: PathMethodResponse<'/authed/userHeads'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/userHeads', 'get'>

      const profiles = await prisma.profile.findMany({
        where: {
          NOT: {
            userId: authedReq.userId
          }
        },
        orderBy: {
          username: 'asc'
        }
      })

      const userheadPromises = profiles.map(async (profile) => ({
        userId: profile.userId,
        username: profile.username,
        avatar: await getAvatar(profile.avatar)
      }))

      const userheads: Userhead[] = await Promise.all(userheadPromises)

      return res.status(StatusCodes.OK).json(userheads)
    } catch (error) {
      console.error(`get /userHeads error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not get users' })
    }
  }
)

export default router

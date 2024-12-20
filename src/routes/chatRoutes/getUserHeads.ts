import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from '../../database'
import AuthedRequest from '../../middlewares/authedRequest'
import { components } from '@openapi/schema'
import { getAvatar } from '../../storage/s3Accessors'

type Userhead = components['schemas']['UserDetails']

const router = express.Router()

router.get(
  '/userHeads',
  async (
    req: PathMethodRequest<'/api/authed/userHeads', 'get'>,
    res: PathMethodResponse<'/api/authed/userHeads'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/api/authed/userHeads', 'get'>

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
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get users' })
    }
  }
)

export default router

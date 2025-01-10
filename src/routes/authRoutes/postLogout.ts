import { PathMethodRequest, PathMethodResponse } from '@openapi/expressApiTypes'
import env from '@src/config'
import disconnectUser from '@src/websocket/disconnectUser'
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'

const router = express.Router()

router.post(
  '/logout',
  async (
    req: PathMethodRequest<'/api/logout', 'post'>,
    res: PathMethodResponse<'/api/logout'>
  ) => {
    const token = req?.cookies['auth-token']

    if (token) {
      const decoded = await jwt.verify(token, env.TOKEN_SECRET)
      const userId = (decoded as JwtPayload).userId
      disconnectUser(userId)
    }

    res
      .status(StatusCodes.OK)
      .cookie('auth-token', '', {
        expires: new Date(0)
      })
      .json({
        message: 'User was logged out'
      })
  }
)

export default router

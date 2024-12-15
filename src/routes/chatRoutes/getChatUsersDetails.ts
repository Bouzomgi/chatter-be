import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import AuthedRequest from '../../middlewares/authedRequest'
import { getAvatar } from '../../storage/s3Accessors'
import { pullChatUsersDetails } from '../../queries/pullChatUsersDetails'

const router = express.Router()

router.get(
  '/chatUsersDetails',
  async (
    req: PathMethodRequest<'/api/authed/chatUsersDetails', 'get'>,
    res: PathMethodResponse<'/api/authed/chatUsersDetails'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<
        '/api/authed/chatUsersDetails',
        'get'
      >

      const chatUsersDetails = await pullChatUsersDetails(authedReq.userId)

      const completeChatUsersDetailsPromises = chatUsersDetails.map(
        async (userDetails) => {
          const avatar = await getAvatar(userDetails.avatar)
          return {
            ...userDetails,
            avatar: avatar
          }
        }
      )

      const completeChatUsersDetails = await Promise.all(
        completeChatUsersDetailsPromises
      )

      return res.status(StatusCodes.OK).json(completeChatUsersDetails)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get chat heads' })
    }
  }
)

export default router

import { PathMethodRequest, PathMethodResponse } from '@openapi/expressApiTypes'
import AuthedRequest from '@src/middlewares/authedRequest'
import { pullChatUsersDetails } from '@src/queries/pullChatUsersDetails'
import { getAvatar } from '@src/storage/s3Accessors'
import express from 'express'
import { StatusCodes } from 'http-status-codes'

const router = express.Router()

router.get(
  '/chatUsersDetails',
  async (
    req: PathMethodRequest<'/authed/chatUsersDetails', 'get'>,
    res: PathMethodResponse<'/authed/chatUsersDetails'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/chatUsersDetails', 'get'>

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
    } catch (error) {
      console.error(`get /chatUsers error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not get chat heads' })
    }
  }
)

export default router

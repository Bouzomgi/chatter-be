import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import { pullLatestMessages } from '../../queries/pullLatestMessages'
import AuthedRequest from '../../middlewares/authedRequest'
import { getAvatar } from '../../storage/s3Accessors'

const router = express.Router()

router.get(
  '/chatheads',
  async (
    req: PathMethodRequest<'/authed/chatHeads', 'get'>,
    res: PathMethodResponse<'/authed/chatHeads'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/chatHeads', 'get'>

      // pull the messages, then get the avatars
      const messages = await pullLatestMessages(authedReq.userId)

      const chatheadPromises = messages.map(async (msg) => ({
        conversationId: msg.conversationId,
        threadId: msg.threadId,
        message: {
          messageId: msg.messageId,
          fromUserId: msg.fromUserId,
          content: msg.content,
          createdAt: msg.createdAt
        },
        avatar: await getAvatar(msg.avatar),
        unseenMessageId: msg.unseenMessageId
      }))

      const chatheads = await Promise.all(chatheadPromises)

      return res.status(StatusCodes.OK).json(chatheads)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get chat heads' })
    }
  }
)

export default router

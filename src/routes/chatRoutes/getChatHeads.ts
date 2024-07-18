import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import { pullLatestMessages } from '../../queries/pullLatestMessages'
import AuthedRequest from '../../middlewares/authedRequest'

const router = express.Router()

router.get(
  '/chatHeads',
  async (
    req: PathMethodRequest<'/authed/chatHeads', 'get'>,
    res: PathMethodResponse<'/authed/chatHeads'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/chatHeads', 'get'>

      // pull the messages, then get the avatars
      const messages = await pullLatestMessages(authedReq.userId)

      const chatHeads = messages.map((msg) => ({
        conversationId: msg.conversationId,
        threadId: msg.threadId,
        message: {
          messageId: msg.messageId,
          fromUserId: msg.fromUserId,
          content: msg.content,
          createdAt: msg.createdAt
        },
        unseenMessageId: msg.unseenMessageId
      }))

      return res.status(StatusCodes.OK).json(chatHeads)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get chat heads' })
    }
  }
)

export default router

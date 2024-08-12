import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from '../../database'
import AuthedRequest from '../../middlewares/authedRequest'
import { pullChatDetails } from '../../queries/pullChatDetails'

const router = express.Router()

router.get(
  '/chats',
  async (
    req: PathMethodRequest<'/authed/chats', 'get'>,
    res: PathMethodResponse<'/authed/chats'>
  ) => {
    try {
      const authedReq = req as AuthedRequest<'/authed/chats', 'get'>

      const chatDetails = await pullChatDetails(authedReq.userId)

      const promisedChats = chatDetails.map(async (chat) => {
        const messages = await prisma.message.findMany({
          where: {
            conversationId: chat.conversationId
          },
          select: {
            id: true,
            fromUserId: true,
            createdAt: true,
            content: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        })

        const members = await prisma.thread.findMany({
          where: {
            conversationId: chat.conversationId
          },
          select: {
            memberId: true
          }
        })

        const renamedChats = messages.map((message) => ({
          messageId: message.id,
          createdAt: message.createdAt.toISOString(),
          content: message.content,
          fromUserId: message.fromUserId
        }))

        return {
          conversationId: chat.conversationId,
          threadId: chat.threadId,
          members: members.map((elem) => elem.memberId),
          unseenMessageId: chat.unseenMessageId,
          messages: renamedChats
        }
      })

      const chats = await Promise.all(promisedChats)

      return res.status(StatusCodes.OK).json(chats)
    } catch {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not get messages' })
    }
  }
)

export default router

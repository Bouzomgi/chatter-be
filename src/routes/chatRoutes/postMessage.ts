import express from 'express'
import { checkSchema, validationResult } from 'express-validator'
import { StatusCodes } from 'http-status-codes'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import AuthedRequest from '../../middlewares/authedRequest'
import { notifyUser } from '../../websocket/messageSocket'
import prisma from './../../database'

const router = express.Router()

router.post(
  '/message',
  checkSchema({
    'members': {
      in: ['body'],
      notEmpty: true,
      isArray: { options: { min: 2 } }
    },
    'members.*': {
      in: ['body'],
      notEmpty: true,
      isNumeric: true
    },
    'content': { in: ['body'], notEmpty: true }
  }),
  async (
    req: PathMethodRequest<'/api/authed/message', 'post'>,
    res: PathMethodResponse<'/api/authed/message'>
  ) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.error('post /message validation failed:', errors.array())
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Could not send message' })
      }

      const authedReq = req as AuthedRequest<'/api/authed/message', 'post'>
      const members: Array<number> = authedReq.body.members

      // Check if the user is in the members list
      if (!members.includes(authedReq.userId)) {
        console.error('User is not a member of the chat')
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Could not send message' })
      }

      // Try to find an existing conversation
      const conversations = await prisma.thread.groupBy({
        by: ['conversationId'],
        where: {
          memberId: { in: members }
        },
        having: {
          conversationId: {
            _count: { equals: members.length }
          }
        }
      })

      // If no conversation exists, ensure members exist
      if (!conversations.length) {
        const users = await prisma.user.findMany({
          where: { id: { in: members } }
        })

        if (users.length !== members.length) {
          console.error('Not all members found in the system')
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Could not send message' })
        }
      }

      const createConversation = async (members: number[]) => {
        const conversation = await prisma.conversation.create({ data: {} })
        const threads = members.map((member) =>
          prisma.thread.create({
            data: {
              conversationId: conversation.id,
              memberId: member
            }
          })
        )
        await Promise.all(threads)
        return conversation.id
      }

      const messageResult = await prisma.$transaction(async () => {
        const conversationId = conversations.length
          ? conversations[0].conversationId
          : await createConversation(members)

        const message = await prisma.message.create({
          data: {
            conversationId,
            fromUserId: authedReq.userId,
            content: authedReq.body.content
          }
        })

        const otherThreads = await prisma.thread.findMany({
          where: {
            conversationId,
            NOT: { memberId: authedReq.userId },
            unseenMessageId: null
          }
        })

        const threadPromises = otherThreads.map(async (thread) => {
          await prisma.thread.update({
            where: { id: thread.id },
            data: { unseenMessageId: message.id }
          })
        })

        await Promise.all(threadPromises)

        const allThreads = await prisma.thread.findMany({
          where: { conversationId }
        })

        const currentThread = allThreads.find(
          (x) => x.memberId === authedReq.userId
        )

        let completeMessage = {
          conversationId: currentThread!.conversationId,
          threadId: currentThread!.id,
          members,
          message: {
            messageId: message.id,
            fromUserId: message.fromUserId,
            createdAt: message.createdAt.toString(),
            content: message.content
          }
        }

        // Notify users involved in the conversation
        const usersToNotify = members.filter((x) => x !== authedReq.userId)
        usersToNotify.forEach((userId) => {
          const userThreadId = allThreads.find((x) => x.memberId === userId)!.id
          completeMessage = { ...completeMessage, threadId: userThreadId }
          notifyUser(userId, completeMessage)
        })

        return { ...completeMessage, threadId: currentThread!.id }
      })

      return res.status(StatusCodes.CREATED).json(messageResult)
    } catch (error) {
      console.error(`post /message error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not send message' })
    }
  }
)

export default router

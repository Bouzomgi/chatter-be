import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import AuthedRequest from '../../middlewares/authedRequest'
import { checkSchema, validationResult } from 'express-validator'
import { notifyUser } from '../../websockets/messageSocket'

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
      await validationResult(req).throw()

      const authedReq = req as AuthedRequest<'/api/authed/message', 'post'>

      const members: Array<number> = authedReq.body.members

      if (!members.includes(authedReq.userId)) {
        throw new Error('user is not a member of the chat')
      }

      // try to find the conversation that is being specified in the req
      const conversations = await prisma.thread.groupBy({
        by: ['conversationId'],
        where: {
          memberId: {
            in: members
          }
        },
        having: {
          conversationId: {
            _count: {
              equals: members.length
            }
          }
        }
      })

      // if no conversation already exists, make sure specified members exist
      if (!conversations.length) {
        const users = await prisma.user.findMany({
          where: { id: { in: members } }
        })

        if (users.length != members.length)
          throw new Error('a specified member does not exist')
      }

      const createConversation = async (members: number[]) => {
        // create a conversation and threads for each user
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
            conversationId: conversationId,
            fromUserId: authedReq.userId,
            content: authedReq.body.content
          }
        })

        // find all threads other than the senders that are not unseen
        const otherThreads = await prisma.thread.findMany({
          where: {
            conversationId: conversationId,
            NOT: { memberId: authedReq.userId },
            unseenMessageId: null
          }
        })

        const threadPromises = otherThreads.map(async (thread) => {
          await prisma.thread.update({
            where: {
              id: thread.id
            },
            data: {
              unseenMessageId: message.id
            }
          })
        })

        await Promise.all(threadPromises)

        const allThreads = await prisma.thread.findMany({
          where: {
            // eslint-disable-next-line camelcase
            conversationId: conversationId
          }
        })

        const currentThread = allThreads.find(
          (x) => x.memberId === authedReq.userId
        )

        let completeMessage = {
          conversationId: currentThread!.conversationId,
          threadId: currentThread!.id,
          members: members,
          message: {
            messageId: message.id,
            fromUserId: message.fromUserId,
            createdAt: message.createdAt.toString(),
            content: message.content
          }
        }

        // notify all active involved users about the sent message
        const usersToNotify = members.filter((x) => x != authedReq.userId)

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
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not send message' })
    }
  }
)

export default router

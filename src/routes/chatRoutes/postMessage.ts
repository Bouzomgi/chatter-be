import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import AuthedRequest from '../../middlewares/authedRequest'
import { checkSchema, validationResult } from 'express-validator'

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
    req: PathMethodRequest<'/authed/message', 'post'>,
    res: PathMethodResponse<'/authed/message'>
  ) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as AuthedRequest<'/authed/message', 'post'>

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
        const conversation = await prisma.conversation.create({})
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

        const currentThread = await prisma.thread.findUnique({
          where: {
            // eslint-disable-next-line camelcase
            conversationId_memberId: {
              conversationId: conversationId,
              memberId: authedReq.userId
            }
          }
        })

        return {
          conversationId: currentThread!.conversationId,
          threadId: currentThread!.id,
          memberId: currentThread!.memberId,
          message: {
            messageId: message.id,
            fromUserId: message.fromUserId,
            createdAt: message.createdAt.toString(),
            content: message.content
          }
        }
      })

      return res.status(StatusCodes.CREATED).json(messageResult)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not send message' })
    }
  }
)

export default router

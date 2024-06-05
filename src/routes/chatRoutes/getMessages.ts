import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import { checkSchema, validationResult } from 'express-validator'
import AuthedRequest from '../../middlewares/authedRequest'
import { components } from '../../../openapi/schema'

type Message = components['schemas']['Message']

const router = express.Router()

router.get(
  '/messages/:threadId',
  checkSchema({
    threadId: {
      in: ['params'],
      isNumeric: true
    }
  }),
  async (
    req: PathMethodRequest<'/authed/messages/{threadId}', 'get'>,
    res: PathMethodResponse<'/authed/messages/{threadId}'>
  ) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as AuthedRequest<
        '/authed/messages/{threadId}',
        'get'
      >
      const threadId = parseInt(authedReq.params.threadId)

      // make sure user is authorized to access the requested conversation
      const thread = await prisma.thread.findUnique({
        where: {
          id: threadId,
          memberId: authedReq.userId
        }
      })

      if (!thread) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Unauthorized' })
      }

      const threadMessages = await prisma.conversation.findFirst({
        where: {
          threads: {
            some: {
              id: threadId
            }
          }
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          },
          threads: true
        }
      })

      const messages: Message[] = threadMessages!.messages.map((msg) => ({
        messageId: msg.id,
        fromUserId: msg.fromUserId,
        createdAt: msg.createdAt.toString(),
        content: msg.content
      }))

      return res.status(StatusCodes.OK).json(messages)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get messages' })
    }
  }
)

export default router

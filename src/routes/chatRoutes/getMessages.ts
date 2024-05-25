import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import { AuthedRequest } from '../../middlewares/tokenVerification'
import { checkSchema, validationResult } from 'express-validator'

const router = express.Router()

interface GetMessageRequest extends AuthedRequest {
  params: {
    threadId: string
  }
}

router.get(
  '/messages/:threadId',
  checkSchema({
    threadId: {
      in: ['params'],
      isNumeric: true
    }
  }),
  async (req: Request, res: Response) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as GetMessageRequest
      const threadId = parseInt(authedReq.params.threadId)

      // make sure user is authorized to access the requested conversation
      const thread = await prisma.thread.findUnique({
        where: {
          id: threadId,
          member: authedReq.userId
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

      return res.status(StatusCodes.OK).json(threadMessages!.messages)
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not get messages' })
    }
  }
)

export default router

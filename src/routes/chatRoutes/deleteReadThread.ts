import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import { AuthedRequest } from '../../middlewares/tokenVerification'
import { checkSchema, validationResult } from 'express-validator'

const router = express.Router()

interface DeleteReadThreadRequest extends AuthedRequest {
  params: {
    threadId: string
  }
}

router.delete(
  '/readThread/:threadId',
  checkSchema({
    threadId: {
      in: ['params'],
      isNumeric: true
    }
  }),
  async (req: Request, res: Response) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as DeleteReadThreadRequest
      const threadId = parseInt(authedReq.params.threadId)

      // make sure user is authorized to their unseen message
      const thread = await prisma.thread.findUnique({
        where: {
          id: threadId,
          member: authedReq.userId
        }
      })

      if (thread === null) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Unauthorized' })
      }

      if (thread.unseen === null) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Thread was not found' })
      }

      await prisma.thread.update({
        where: {
          id: threadId
        },
        data: {
          unseen: null
        }
      })

      return res
        .status(StatusCodes.GONE)
        .json({ error: 'Thread has been read' })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not read message' })
    }
  }
)

export default router

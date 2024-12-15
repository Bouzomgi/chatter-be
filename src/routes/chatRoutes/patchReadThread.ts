import express from 'express'
import {
  PathMethodRequest,
  PathMethodResponse
} from '../../../openapi/expressApiTypes'
import { StatusCodes } from 'http-status-codes'
import prisma from '../../database'
import AuthedRequest from '../../middlewares/authedRequest'
import { checkSchema, validationResult } from 'express-validator'

const router = express.Router()

router.patch(
  '/readThread/:threadId',
  checkSchema({
    threadId: {
      in: ['params'],
      isNumeric: true
    }
  }),
  async (
    req: PathMethodRequest<'/api/authed/readThread/{threadId}', 'patch'>,
    res: PathMethodResponse<'/api/authed/readThread/{threadId}'>
  ) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as AuthedRequest<
        '/api/authed/readThread/{threadId}',
        'patch'
      >
      const threadId = parseInt(authedReq.params.threadId)

      // make sure user is authorized to their unseen message
      const thread = await prisma.thread.findUnique({
        where: {
          id: threadId,
          memberId: authedReq.userId
        }
      })

      if (thread === null) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Thread was not found' })
      }

      await prisma.thread.update({
        where: {
          id: threadId
        },
        data: {
          unseenMessageId: null
        }
      })

      return res.status(StatusCodes.OK).json({ message: 'Read thread' })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not read thread' })
    }
  }
)

export default router

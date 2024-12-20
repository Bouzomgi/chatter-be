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
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        console.error('patch /readThread validation failed:', errors.array())
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: 'Could not read thread' })
      }

      const authedReq = req as AuthedRequest<
        '/api/authed/readThread/{threadId}',
        'patch'
      >
      const threadId = parseInt(authedReq.params.threadId)

      // Check if the thread exists and the user is authorized to mark it as read
      const thread = await prisma.thread.findUnique({
        where: {
          id: threadId,
          memberId: authedReq.userId
        }
      })

      if (!thread) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: 'Thread was not found' })
      }

      // Mark the message as read
      await prisma.thread.update({
        where: {
          id: threadId
        },
        data: {
          unseenMessageId: null
        }
      })

      return res
        .status(StatusCodes.OK)
        .json({ message: 'Thread marked as read' })
    } catch (error) {
      console.error(`patch /readThread error: ${error}`)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: 'Could not read thread' })
    }
  }
)

export default router

import express, { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../../database'
import { AuthedRequest } from '../../middlewares/tokenVerification'
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
  async (req: Request, res: Response) => {
    try {
      await validationResult(req).throw()

      const authedReq = req as AuthedRequest
      const { content } = authedReq.body

      const members: Array<number> = authedReq.body.members

      if (!members.includes(authedReq.userId)) {
        throw new Error('user is not a member of the chat')
      }

      // try to find the conversation that is being specified in the req
      const conversations = await prisma.thread.groupBy({
        by: ['conversationId'],
        where: {
          member: {
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
              member: member
            }
          })
        )
        await Promise.all(threads)
        return conversation.id
      }

      await prisma.$transaction(async () => {
        const conversationId = conversations.length
          ? conversations[0].conversationId
          : await createConversation(members)

        const message = await prisma.message.create({
          data: {
            conversationId: conversationId,
            fromUser: authedReq.userId,
            content: content
          }
        })

        // find all threads other than the senders that are not unseen
        const otherThreads = await prisma.thread.findMany({
          where: {
            conversationId: conversationId,
            NOT: { member: authedReq.userId },
            unseen: null
          }
        })

        const threadPromises = otherThreads.map(async (thread) => {
          await prisma.thread.update({
            where: {
              id: thread.id
            },
            data: {
              unseen: message.id
            }
          })
        })

        await Promise.all(threadPromises)
      })

      return res
        .status(StatusCodes.CREATED)
        .json({ message: 'Sent new message' })
    } catch {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Could not send message' })
    }
  }
)

export default router

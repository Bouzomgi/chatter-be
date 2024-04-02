import express from 'express'
import { StatusCodes } from 'http-status-codes'
import prisma from './../database'
import { AuthedRequest } from '../middlewares/verifyToken'

const router = express.Router()

// TODO: validation with zod
router.get('/getChatHeads', async (req, res) => {
  try {
    const authedReq = req as AuthedRequest
    // get all last messages, usernames, avatars, timestamps, unreads in the right order

    const threads = await prisma.thread.findMany({
      where: {
        member: authedReq.userId
      },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        }
      }
    })

    const chatheads = threads.map((thread) => {
      const lastMessage = thread.conversation.messages[0]
      const { id, ...rest } = lastMessage

      return {
        threadId: thread.id,
        messageId: id,
        ...rest
      }
    })

    // sort chatheads from newest to oldest
    chatheads.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()

      if (isNaN(dateA) || isNaN(dateB)) {
        // Handle invalid dates
        return 0 // No change in order
      }

      return dateA - dateB
    })

    return res.status(StatusCodes.OK).json(chatheads)
  } catch {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not get chat heads' })
  }
})

interface GetMessageRequest extends AuthedRequest {
  params: {
    threadId: string
  }
}

router.get('/getMessages/:threadId', async (req, res) => {
  try {
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

    return res.status(StatusCodes.OK).json(threadMessages?.messages)
  } catch (error) {
    console.log(error)
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not get messages' })
  }
})

router.post('/postMessage', async (req, res) => {
  try {
    const authedReq = req as AuthedRequest

    const { threadId, content } = authedReq.body

    // make sure user is authorized to send a message to the specified thread
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

    const message = await prisma.message.create({
      data: {
        conversationId: thread.conversationId,
        fromUser: authedReq.userId,
        content: content
      }
    })

    const unseenMessage = await prisma.unseen.findUnique({
      where: { threadId }
    })

    if (!unseenMessage) {
      await prisma.unseen.create({
        data: {
          threadId,
          messageId: message.id
        }
      })
    }

    return res.status(StatusCodes.CREATED).json({ message: 'Sent new message' })
  } catch {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not send message' })
  }
})

interface DeleteReadThreadRequest extends AuthedRequest {
  params: {
    threadId: string
  }
}

router.delete('/readThread/:threadId', async (req, res) => {
  try {
    const authedReq = req as DeleteReadThreadRequest
    const threadId = parseInt(authedReq.params.threadId)

    // make sure user is authorized to delete an unseen row in Unseen
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

    const unseenThreads = await prisma.unseen.delete({
      where: { id: threadId }
    })

    if (!unseenThreads) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: 'Thread was not found' })
    }

    return res.status(StatusCodes.GONE).json({ error: 'Thread has been read' })
  } catch {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Could not read message' })
  }
})

export default router

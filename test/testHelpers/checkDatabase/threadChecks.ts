import prisma from '@src/database'

// Checks if a thread is marked as read based on threadId
export const isThreadRead = async (threadId: number) => {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: {
      unseenMessageId: true
    }
  })

  if (thread == null) {
    throw new Error('Thread does not exist')
  }

  return thread.unseenMessageId == null
}

import prisma from '@src/database'

// Fetches all threads for a particular conversationId
export const getThreads = (conversationId: number) =>
  prisma.thread.findMany({
    where: { conversationId }
  })

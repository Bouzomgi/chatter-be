import prisma from '../database'

type ChatDetails = {
  conversationId: number
  threadId: number
  memberId: number
  unseenMessageId?: number
}

/*
  Returns all user details of users 
*/
export const pullChatDetails = (userId: number) =>
  prisma.$queryRaw<ChatDetails[]>`
    SELECT 
      "UserThreads"."id" AS "threadId",
      "UserThreads"."conversationId",
      "UserThreads"."unseenMessageId",
      "Thread"."memberId"
    FROM   
      (SELECT *
      FROM "Thread"
      WHERE "memberId" = 1) AS "UserThreads"
    INNER JOIN "Thread"
    ON "Thread"."conversationId" = "UserThreads"."conversationId"
    WHERE NOT "Thread"."memberId" = ${userId}
  `

import prisma from '../database'
import { components } from '../../openapi/schema'

type ChatDetails = components['schemas']['ChatDetails']

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
      WHERE "memberId" = ${userId}) AS "UserThreads"
    INNER JOIN "Thread"
    ON "Thread"."conversationId" = "UserThreads"."conversationId"
    WHERE NOT "Thread"."memberId" = ${userId}
  `

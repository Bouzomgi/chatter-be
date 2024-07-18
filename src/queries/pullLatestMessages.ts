import prisma from '../database'
import { components } from '../../openapi/schema'

type Message = components['schemas']['Message']

export type CompleteMessage = Message & {
  conversationId: number
  threadId: number
  unseenMessageId?: number
}

/*
  Returns the last message from each chat the passed in user is part of, 
  sorted by createdAt datetime
*/
export const pullLatestMessages = (userId: number) =>
  prisma.$queryRaw<CompleteMessage[]>`
    SELECT 
      "messageId"
      "B"."conversationId",
      "content",
      "B"."createdAt", 
      "fromUserId", 
      "unseenMessageId", 
      "Thread"."id" AS "threadId", 
    FROM "Thread"
    INNER JOIN
      (  
        SELECT "A"."conversationId", "content", "A"."createdAt", "fromUserId", "id" AS "messageId"
        FROM "Message"
        INNER JOIN
          (
            SELECT MAX("Message"."createdAt") as "createdAt", "Conversation"."id" AS "conversationId"
            FROM "Message"
            INNER JOIN "Conversation" ON "Message"."conversationId"="Conversation"."id"
            WHERE "Conversation"."id" IN (
              SELECT "conversationId"
              FROM "Thread"
              WHERE "memberId" = ${userId}
            )
            GROUP BY "Conversation"."id"
          ) AS "A"
        ON "Message"."createdAt"="A"."createdAt"
        AND "Message"."conversationId"="A"."conversationId"
      ) AS "B"
    ON "Thread"."memberId" = ${userId}
    AND "Thread"."conversationId"="B"."conversationId"
    ORDER BY "B"."createdAt" ASC
  `

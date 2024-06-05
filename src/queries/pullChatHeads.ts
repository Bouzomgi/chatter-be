import prisma from './../database'
import { components } from '../../openapi/schema'

type Chathead = components['schemas']['Message']

// TODO: FIX THIS!!!!!

/*
  Returns the last message & corresponding data from each chat the passed in user is part of, 
  sorted by createdAt datetime
*/
const pullChatHeads = (userId: number) =>
  prisma.$queryRaw<Chathead[]>`
    SELECT 
      "B"."conversationId", 
      "content", 
      "B"."createdAt", 
      "fromUser", 
      "unseen", 
      "Thread"."id" AS "threadId", 
      "Profile"."avatar"
    FROM "Thread"
    INNER JOIN
      (  
        SELECT "A"."conversationId", "content", "A"."createdAt", "fromUser"
        FROM "Message"
        INNER JOIN
          (
            SELECT MAX("Message"."createdAt") as "createdAt", "Conversation"."id" AS "conversationId"
            FROM "Message"
            INNER JOIN "Conversation" ON "Message"."conversationId"="Conversation"."id"
            WHERE "Conversation"."id" IN (
              SELECT "conversationId"
              FROM "Thread"
              WHERE "member" = ${userId}
            )
            GROUP BY "Conversation"."id"
          ) AS "A"
        ON "Message"."createdAt"="A"."createdAt"
        AND "Message"."conversationId"="A"."conversationId"
      ) AS "B"
    ON "Thread"."member"="B"."fromUser"
    AND "Thread"."conversationId"="B"."conversationId"
    INNER JOIN "Profile" ON "Profile"."id"="B"."fromUser"
    ORDER BY "B"."createdAt" ASC
  `

export default pullChatHeads

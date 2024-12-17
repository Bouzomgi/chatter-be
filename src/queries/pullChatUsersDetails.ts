import prisma from '../database'

export type PrefetchedChatUserDetails = {
  userId: number
  username: string
  avatar: string
}

/*
  Returns all user details of users 
*/
export const pullChatUsersDetails = (userId: number) =>
  prisma.$queryRaw<PrefetchedChatUserDetails[]>`
    SELECT 
      "Thread"."memberId" AS "userId",
      "Profile"."username",
      "Profile"."avatar"
    FROM 
      "Thread"
    INNER JOIN 
      "Profile" ON "Profile"."userId" = "Thread"."memberId"
    WHERE 
      "Thread"."conversationId" IN (
        SELECT 
          "conversationId"
        FROM 
          "Thread"
        WHERE 
          "Thread"."memberId" = ${userId}
      )
      AND "Thread"."memberId" <> ${userId}
    GROUP BY 
      "Thread"."memberId", "Profile"."username", "Profile"."avatar"
    ORDER BY 
      "Thread"."memberId";
  `

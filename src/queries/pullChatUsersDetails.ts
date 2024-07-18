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
      "memberId" AS "userId",
      "username",
      "avatar"
    FROM
      (SELECT 
        DISTINCT "memberId" 
      FROM 
        (SELECT
          "conversationId"
        FROM 
          "Thread"
        WHERE
          "Thread"."memberId" = ${userId}) AS "ParticipantThreads"
      INNER JOIN 
        "Thread"
      ON
        "ParticipantThreads"."conversationId" = "Thread"."conversationId") AS "ParticipantUsers"
    INNER JOIN
      "Profile"
    ON
      "Profile"."userId" = "ParticipantUsers"."memberId"
    WHERE NOT 
      "memberId" = ${userId}
  `

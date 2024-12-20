import prisma from '@src/database'

// Fetches the conversationId for a group of users
export const getConversation = async (userIds: number[]) => {
  const conversationObject = await prisma.$queryRaw<
    { conversationId: number }[]
  >`
    SELECT t1."conversationId"
    FROM "Thread" AS t1
    WHERE t1."memberId" = ANY(${userIds})
    GROUP BY t1."conversationId"
    HAVING COUNT(DISTINCT t1."memberId") = ${userIds.length}
      AND NOT EXISTS (
        SELECT 1
        FROM "Thread" AS t2
        WHERE t2."conversationId" = t1."conversationId"
          AND t2."memberId" <> ALL(${userIds})
      );
  `

  if (conversationObject.length === 0) {
    throw new Error('Conversation does not exist')
  }

  return conversationObject[0].conversationId
}

// Checks if a conversation exists based on a group of userIds
export const doesConversationExist = async (userIds: number[]) => {
  try {
    await getConversation(userIds)
    return true
  } catch {
    return false
  }
}

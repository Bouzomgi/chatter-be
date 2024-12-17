import { Prisma } from '@prisma/client'
import prisma from '../src/database'

async function main() {
  // Seed data for User model
  const users: Prisma.UserUncheckedCreateInput[] = [
    {
      id: 1,
      email: 'adam@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: {
        create: { username: 'adam', avatar: './avatars/default/avatar3.svg' }
      }
    },
    {
      id: 2,
      email: 'britta@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: {
        create: { username: 'britta', avatar: './avatars/default/avatar2.svg' }
      }
    },
    {
      id: 3,
      email: 'carl@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: {
        create: { username: 'carl', avatar: './avatars/default/avatar4.svg' }
      }
    },
    {
      id: 4,
      email: 'dana@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: {
        create: { username: 'dana', avatar: './avatars/default/avatar1.svg' }
      }
    },
    {
      id: 5,
      email: 'edward@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: {
        create: { username: 'edward', avatar: './avatars/default/avatar5.svg' }
      }
    }
  ]

  const conversations: Prisma.ConversationUncheckedCreateInput[] = [
    {
      id: 1,
      messages: {
        create: [
          {
            id: 1,
            fromUserId: 1,
            content: 'Hi Britta, how are you?',
            createdAt: '2024-03-15T10:01:00Z'
          },
          {
            id: 2,
            fromUserId: 2,
            content: "Hey Adam, I'm good, thanks! How about you?",
            createdAt: '2024-03-16T10:00:00Z'
          },
          {
            id: 3,
            fromUserId: 1,
            content: "I'm doing well too. Did you see the game last night?",
            createdAt: '2024-03-18T15:00:00Z'
          },
          {
            id: 4,
            fromUserId: 2,
            content: 'Yes, the game was amazing!',
            createdAt: '2024-03-20T18:00:00Z'
          },
          {
            id: 5,
            fromUserId: 2,
            content: 'Who do you think will win the championship?',
            createdAt: '2024-03-20T18:00:42Z'
          },
          {
            id: 6,
            fromUserId: 1,
            content:
              'I think Team A has a good chance. They played exceptionally well in the last few games.',
            createdAt: '2024-03-20T18:03:06Z'
          },
          {
            id: 7,
            fromUserId: 1,
            content: 'We should watch a game together sometime.',
            createdAt: '2024-03-20T22:00:06Z'
          },
          {
            id: 8,
            fromUserId: 2,
            content: "That sounds like a plan. Let's do it!",
            createdAt: '2024-03-29T08:00:00Z'
          },
          {
            id: 9,
            fromUserId: 2,
            content: 'Grateful to have you as a friend!',
            createdAt: '2024-03-29T08:00:03Z'
          }
        ]
      }
    },
    {
      id: 2,
      messages: {
        create: [
          {
            id: 10,
            fromUserId: 3,
            content: 'Hey Adam, how have you been?',
            createdAt: '2024-03-15T10:40:00Z'
          }
        ]
      }
    },
    {
      id: 3,
      messages: {
        create: [
          {
            id: 11,
            fromUserId: 4,
            content: 'Do we still have milk?',
            createdAt: '2024-03-15T10:25:00Z'
          }
        ]
      }
    }
  ]

  const conversationUpdate: Prisma.ConversationUncheckedUpdateInput[] = [
    {
      id: 1,
      threads: {
        create: [
          {
            id: 1,
            memberId: 1,
            unseenMessageId: 1
          },
          { id: 2, memberId: 2 }
        ]
      }
    },
    {
      id: 2,
      threads: {
        create: [
          { id: 3, memberId: 1 },
          { id: 4, memberId: 3 }
        ]
      }
    },
    {
      id: 3,
      threads: {
        create: [
          {
            id: 5,
            memberId: 1,
            unseenMessageId: 10
          },
          { id: 6, memberId: 4 }
        ]
      }
    }
  ]

  const correctAutoIncrement = (tableName: string, start: number) => {
    const sequenceName = `${tableName}_id_seq`
    return prisma.$executeRawUnsafe(
      `ALTER SEQUENCE "${sequenceName}" RESTART WITH ${start};`
    )
  }

  // Use Prisma to create the seed data
  await Promise.all(
    users.map((userData) =>
      prisma.user.create({
        data: userData
      })
    )
  )

  await correctAutoIncrement('User', users.length + 1)

  await Promise.all(
    conversations.map((conversationData) =>
      prisma.conversation.create({
        data: conversationData
      })
    )
  )

  await correctAutoIncrement('Conversation', conversations.length + 1)

  // adds and connects the threads
  await Promise.all(
    conversationUpdate.map((conversationData, index) =>
      prisma.conversation.update({
        where: { id: index + 1 },
        data: conversationData
      })
    )
  )

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

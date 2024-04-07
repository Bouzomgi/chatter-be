import { Prisma } from '@prisma/client'
import prisma from '../src/database'

async function main() {
  // Seed data for User model
  const users: Prisma.UserUncheckedCreateInput[] = [
    {
      id: 1,
      username: 'adam',
      email: 'adam@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar1.svg' } }
    },
    {
      id: 2,
      username: 'britta',
      email: 'britta@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar2.svg' } }
    },
    {
      id: 3,
      username: 'carl',
      email: 'carl@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar3.svg' } }
    },
    {
      id: 4,
      username: 'dana',
      email: 'dana@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar4.svg' } }
    },
    {
      id: 5,
      username: 'edward',
      email: 'edward@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar5.svg' } }
    }
  ]

  const conversations: Prisma.ConversationUncheckedCreateInput[] = [
    {
      // Adam and Britta
      threads: {
        create: [
          {
            id: 1,
            member: 1
          },
          {
            id: 2,
            member: 2
          }
        ]
      },
      messages: {
        create: [
          {
            id: 1,
            fromUser: 1,
            content: 'Hi Britta, how are you?',
            createdAt: '2024-03-15T10:00:00Z'
          },
          {
            id: 2,
            fromUser: 2,
            content: "Hey Adam, I'm good, thanks! How about you?",
            createdAt: '2024-03-16T10:00:00Z'
          },
          {
            id: 3,
            fromUser: 1,
            content: "I'm doing well too. Did you see the game last night?",
            createdAt: '2024-03-18T15:00:00Z'
          },
          {
            id: 4,
            fromUser: 2,
            content: 'Yes, the game was amazing!',
            createdAt: '2024-03-20T18:00:00Z'
          },
          {
            id: 5,
            fromUser: 2,
            content: 'Who do you think will win the championship?',
            createdAt: '2024-03-20T18:00:02Z'
          },
          {
            id: 6,
            fromUser: 1,
            content:
              'I think Team A has a good chance. They played exceptionally well in the last few games.',
            createdAt: '2024-03-20T18:00:06Z'
          },
          {
            id: 7,
            fromUser: 1,
            content: 'We should watch a game together sometime.',
            createdAt: '2024-03-20T22:00:06Z'
          },
          {
            id: 8,
            fromUser: 2,
            content: "That sounds like a plan. Let's do it!",
            createdAt: '2024-03-29T08:00:00Z'
          }
        ]
      }
    },
    {
      // Adam and Carl
      threads: {
        create: [
          {
            id: 3,
            member: 1
          },
          {
            id: 4,
            member: 3
          }
        ]
      },
      messages: {
        create: [
          {
            id: 9,
            fromUser: 3,
            content: 'Hey Adam, how have you been?',
            createdAt: '2024-03-15T10:00:00Z'
          }
        ]
      }
    },
    {
      // Adam and Dana
      threads: {
        create: [
          {
            id: 5,
            member: 1
          },
          {
            id: 6,
            member: 4
          }
        ]
      },
      messages: {
        create: [
          {
            id: 10,
            fromUser: 4,
            content: 'Do we still have milk?',
            createdAt: '2024-03-15T10:00:00Z'
          }
        ]
      }
    }
  ]

  // Seed data for Unseen model
  const unseens: Prisma.UnseenUncheckedCreateInput[] = [
    {
      threadId: 1,
      messageId: 5
    },
    {
      threadId: 5,
      messageId: 10
    }
  ]

  // Use Prisma to create the seed data
  await Promise.all(
    users.map((userData) =>
      prisma.user.create({
        data: userData
      })
    )
  )

  await Promise.all(
    conversations.map((conversationData) =>
      prisma.conversation.create({
        data: conversationData
      })
    )
  )

  await Promise.all(
    unseens.map((unseenData) =>
      prisma.unseen.create({
        data: unseenData
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

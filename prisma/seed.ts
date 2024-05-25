import { Prisma } from '@prisma/client'
import prisma from '../src/database'

async function main() {
  // Seed data for User model
  const users: Prisma.UserUncheckedCreateInput[] = [
    {
      username: 'adam',
      email: 'adam@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar1.svg' } }
    },
    {
      username: 'britta',
      email: 'britta@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar2.svg' } }
    },
    {
      username: 'carl',
      email: 'carl@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar3.svg' } }
    },
    {
      username: 'dana',
      email: 'dana@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar4.svg' } }
    },
    {
      username: 'edward',
      email: 'edward@example.com',
      password: '$2b$10$qdzjQqja/hWZRTBydgm5POVg/ZsKAuNHdDVNbGO.lgFs6dJVe.WdG', // 'a'
      profile: { create: { avatar: './avatars/default/avatar5.svg' } }
    }
  ]

  const conversations: Prisma.ConversationUncheckedCreateInput[] = [
    {
      messages: {
        create: [
          {
            fromUser: 1,
            content: 'Hi Britta, how are you?',
            createdAt: '2024-03-15T10:01:00Z'
          },
          {
            fromUser: 2,
            content: "Hey Adam, I'm good, thanks! How about you?",
            createdAt: '2024-03-16T10:00:00Z'
          },
          {
            fromUser: 1,
            content: "I'm doing well too. Did you see the game last night?",
            createdAt: '2024-03-18T15:00:00Z'
          },
          {
            fromUser: 2,
            content: 'Yes, the game was amazing!',
            createdAt: '2024-03-20T18:00:00Z'
          },
          {
            fromUser: 2,
            content: 'Who do you think will win the championship?',
            createdAt: '2024-03-20T18:00:02Z'
          },
          {
            fromUser: 1,
            content:
              'I think Team A has a good chance. They played exceptionally well in the last few games.',
            createdAt: '2024-03-20T18:00:06Z'
          },
          {
            fromUser: 1,
            content: 'We should watch a game together sometime.',
            createdAt: '2024-03-20T22:00:06Z'
          },
          {
            fromUser: 2,
            content: "That sounds like a plan. Let's do it!",
            createdAt: '2024-03-29T08:00:00Z'
          }
        ]
      }
    },
    {
      messages: {
        create: [
          {
            fromUser: 3,
            content: 'Hey Adam, how have you been?',
            createdAt: '2024-03-15T10:40:00Z'
          }
        ]
      }
    },
    {
      messages: {
        create: [
          {
            fromUser: 4,
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
            member: 1,
            unseen: 1
          },
          { member: 2 }
        ]
      }
    },
    {
      id: 2,
      threads: {
        create: [{ member: 1 }, { member: 3 }]
      }
    },
    {
      id: 3,
      threads: {
        create: [
          {
            member: 1,
            unseen: 10
          },
          { member: 4 }
        ]
      }
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

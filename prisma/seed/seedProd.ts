import prismaEnv from '@prisma/config'
import hashPassword from '@src/utils/hashPassword'
import prisma from './database'

async function seedProd() {
  // Seed data for User model
  const serviceAccountEmail = `${prismaEnv.SERVICE_ACCOUNT_USERNAME}@example.com`
  const serviceAccountAvatar = './avatars/default/avatar4.svg'
  const hashedPassword = await hashPassword(prismaEnv.SERVICE_ACCOUNT_PASSWORD)

  await prisma.user.upsert({
    where: { email: serviceAccountEmail },
    update: {
      password: hashedPassword,
      profile: {
        update: {
          username: prismaEnv.SERVICE_ACCOUNT_USERNAME,
          avatar: serviceAccountAvatar
        }
      }
    },
    create: {
      email: serviceAccountEmail,
      password: hashedPassword,
      profile: {
        create: {
          username: prismaEnv.SERVICE_ACCOUNT_USERNAME,
          avatar: serviceAccountAvatar
        }
      }
    }
  })
}

export default seedProd

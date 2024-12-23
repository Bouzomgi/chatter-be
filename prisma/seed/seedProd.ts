import env from '@src/config'
import prisma from '@src/database'
import hashPassword from '@src/utils/hashPassword'

async function seedProd() {
  // Seed data for User model

  const serviceAccountEmail = `${env.SERVICE_ACCOUNT_USERNAME}@example.com`
  const serviceAccountAvatar = './avatars/default/avatar4.svg'
  const hashedPassword = await hashPassword(env.SERVICE_ACCOUNT_PASSWORD)

  console.log('PASSY', env.SERVICE_ACCOUNT_PASSWORD, hashedPassword)

  await prisma.user.upsert({
    where: { email: serviceAccountEmail },
    update: {
      password: hashedPassword,
      profile: {
        update: {
          username: env.SERVICE_ACCOUNT_USERNAME,
          avatar: serviceAccountAvatar
        }
      }
    },
    create: {
      email: serviceAccountEmail,
      password: hashedPassword,
      profile: {
        create: {
          username: env.SERVICE_ACCOUNT_USERNAME,
          avatar: serviceAccountAvatar
        }
      }
    }
  })
}

export default seedProd

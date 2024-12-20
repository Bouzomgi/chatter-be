import prisma from '@src/database'

// Checks if the username is registered
export const isUsernameRegistered = async (username: string) => {
  const user = await prisma.profile.findUnique({
    where: { username },
    include: {
      user: true
    }
  })

  return user !== null
}

// Checks if the email is registered
export const isEmailRegistered = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true
    }
  })

  return user !== null
}

// Checks if the user exists based on userId
export const doesUserExist = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  return user != null
}

export const getAvatar = async (userId: number) => {
  const user = await prisma.profile.findUnique({
    where: { userId }
  })

  return user?.avatar
}

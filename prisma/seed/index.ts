import env from '../../src/config'
import prisma from '../../src/database'
import seedIntegration from './seedIntegration'
import seedProd from './seedProd'

async function main() {
  switch (env.NODE_ENV) {
    case 'development':
      await seedIntegration()
      await seedProd()
      break
    case 'test':
      await seedIntegration()
      await seedProd()
      break
    case 'production':
      await seedProd()
      break
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

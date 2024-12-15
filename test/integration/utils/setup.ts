import { execa } from 'execa'

async function deployPrismaMigrations() {
  try {
    const { stdout } = await execa('bash', ['-c', 'npm run refresh-and-seed'])
    console.log(stdout)
  } catch (error) {
    console.error('Script failed:', error)
  }
}

deployPrismaMigrations()

import { spawn } from 'child_process'

/*
  To cut down on testing time, we will only reseed the database between test files
  We need to be cognizant that test file's I/O do not collide
*/
beforeAll((done) => {
  const childProcess = spawn('npm', ['run', 'reset-and-seed'])

  childProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Reset and seeded database...')
    } else {
      console.error(`Reset and seed failed with exit code ${code}`)
    }
    childProcess.kill()
    done()
  })
}, 10000) // Set timeout for this specific hook to 10 seconds

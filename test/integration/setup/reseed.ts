import { spawn } from 'child_process'

/*
  To cut down on testing time, we will only reseed the database between test files
  We need to be cognizant that test file's I/O do not collide
*/
beforeAll((done) => {
  const childProcess = spawn('npm', ['run', 'reset-and-seed'])

  childProcess.on('close', (code) => {
    if (code === 0) {
      console.debug('Reset and seeded database...')
      done()
    } else {
      console.debug(`Reset and seed failed with exit code ${code}`)
      process.exit(1)
    }
  })

  childProcess.on('error', (err) => {
    console.debug('Failed to start child process:', err)
    process.exit(1) // Force an immediate exit if the child process fails to start
  })
}, 10000) // Set timeout for this specific hook to 10 seconds

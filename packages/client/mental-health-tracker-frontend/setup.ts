import { cleanupTestUsers } from './tests/testUserUtils'

export default async function globalSetup() {
  process.env.VITE_BACKEND_URL = 'http://localhost:3005/api/trpc'
  process.env.VITE_TEST_MODE = 'true'
  console.log('VITE_BACKEND_URL set to:', process.env.VITE_BACKEND_URL)
  console.log('VITE_TEST_MODE set to:', process.env.VITE_TEST_MODE)

  // cleanup runs after all tests
  process.on('exit', async () => {
    await cleanupTestUsers()
  })
}

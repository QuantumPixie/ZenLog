import { FullConfig } from '@playwright/test'
import { cleanupTestUser } from './testUserUtils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalTeardown(config: FullConfig) {
  console.log('Running global teardown')
  await cleanupTestUser()
}

export default globalTeardown

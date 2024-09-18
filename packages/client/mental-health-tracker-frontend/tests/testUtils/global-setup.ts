import { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function globalSetup(config: FullConfig) {
  const currentFilePath = fileURLToPath(import.meta.url)
  const monorepoRoot = path.resolve(path.dirname(currentFilePath), '..', '..', '..', '..')
  const envPath = path.join(monorepoRoot, '.env.test')

  console.log('Loading .env.test from:', envPath)
  dotenv.config({ path: envPath })

  process.env.VITE_BACKEND_URL = 'http://localhost:3005/api/trpc'
  process.env.VITE_TEST_MODE = 'true'
  console.log('VITE_BACKEND_URL set to:', process.env.VITE_BACKEND_URL)
  console.log('VITE_TEST_MODE set to:', process.env.VITE_TEST_MODE)
}

export default globalSetup

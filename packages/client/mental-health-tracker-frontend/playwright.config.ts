import type { PlaywrightTestConfig } from '@playwright/test'

export const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4173'

export const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 120000,
  globalSetup: './setup.ts',
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    env: {
      VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || 'http://localhost:3005/api/trpc'
    }
  },
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'list',
  retries: process.env.CI ? 2 : 0
}

export default config

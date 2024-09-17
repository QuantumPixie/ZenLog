import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60000,
  globalSetup: './setup.ts',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:4173',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
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
  reporter: process.env.CI ? 'dot' : 'list'
}

export default config

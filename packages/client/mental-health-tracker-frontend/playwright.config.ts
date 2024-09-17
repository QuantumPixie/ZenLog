import type { PlaywrightTestConfig } from '@playwright/test'
import './setup.ts'

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
    reuseExistingServer: true
  },
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'list'
}

export default config

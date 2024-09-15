import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: process.env.VITE_API_URL || 'http://e2e-server:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  retries: 2,
  workers: 1
}

export default config

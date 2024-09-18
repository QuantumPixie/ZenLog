import { defineConfig, devices } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const currentFilePath = fileURLToPath(import.meta.url)
const projectRoot = path.dirname(currentFilePath)

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
      dependencies: ['setup']
    }
  ],
  globalSetup: path.join(projectRoot, 'tests', 'testUtils', 'global-setup.ts'),
  globalTeardown: path.join(projectRoot, 'tests', 'testUtils', 'global-teardown.ts'),
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000 // Increase timeout to 2 minutes
  },
  timeout: 60000 // Increase overall timeout to 60 seconds
})

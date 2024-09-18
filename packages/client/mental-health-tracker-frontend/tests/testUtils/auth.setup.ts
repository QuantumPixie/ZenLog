import { test as setup, expect } from '@playwright/test'
import { createTestUser } from './testUserUtils'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  console.log('Starting authentication setup')

  const testUser = await createTestUser()

  console.log('Navigating to home page')
  await page.goto('/')

  console.log('Waiting for login/signup button')
  await page.waitForSelector('[data-testid="header-login-signup-button"]', {
    state: 'visible',
    timeout: 60000
  })
  console.log('Clicking login/signup button')
  await page.click('[data-testid="header-login-signup-button"]')

  console.log('Waiting for login form')
  await page.waitForSelector('.login-signup-form', { state: 'visible', timeout: 60000 })

  console.log('Filling email input')
  await page.fill('[data-testid="email-input"]', testUser.email)

  console.log('Filling password input')
  await page.fill('[data-testid="password-input-wrapper"] input', testUser.password)

  console.log('Waiting for login button')
  await page.waitForSelector('[data-testid="login-button"]', { state: 'visible', timeout: 30000 })
  console.log('Clicking login button')
  await page.click('[data-testid="login-button"]')

  console.log('Waiting for success message')
  await expect(page.locator('.p-toast-message')).toContainText('Logged in successfully', {
    timeout: 30000
  })

  console.log('Waiting for redirection to home page')
  await page.waitForURL('/home', { timeout: 30000 })

  console.log('Saving authentication state')
  await page.context().storageState({ path: authFile })
  console.log('Authentication state saved to:', authFile)
})

export default setup

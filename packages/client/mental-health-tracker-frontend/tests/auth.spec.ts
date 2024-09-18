// import { test as setup, expect } from '@playwright/test'
// import { TEST_USER, createTestUser } from './testUtils/testUserUtils'

// const authFile = 'playwright/.auth/user.json'

// setup('authenticate', async ({ page }) => {
//   console.log('Starting authentication process')

//   await createTestUser()

//   await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 })
//   console.log('Page loaded')

//   await page.click('[data-testid="header-login-signup-button"]')
//   await page.waitForSelector('[data-testid="login-button"]', { state: 'visible', timeout: 30000 })
//   console.log('Clicked login button and waiting for login form')

//   await page.fill('[data-testid="email-input"]', TEST_USER.email)
//   console.log('Filled email input')

//   await page.fill('[data-testid="password-input"]', TEST_USER.password)
//   console.log('Filled password input')

//   await page.click('[data-testid="login-button"]')
//   console.log('Submitted login form')

//   await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 30000 })
//   const toastContent = await page.locator('.p-toast-message').textContent()
//   expect(toastContent).toContain('Logged in successfully')
//   console.log('Received successful login message')

//   await page.waitForURL('**/home', { timeout: 30000 })
//   expect(page.url()).toContain('/home')
//   console.log('Navigated to home page')

//   await page.context().storageState({ path: authFile })
//   console.log('Saved authentication state to file')
// })

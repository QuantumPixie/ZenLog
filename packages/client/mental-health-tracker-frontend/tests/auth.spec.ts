import { test as setup, expect, Page } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

const fillPasswordInput = async (page: Page, value: string) => {
  await page.waitForSelector('[data-testid="password-input-wrapper"]', { state: 'visible' })
  await page.click('[data-testid="password-input-wrapper"]')

  const passwordInput = await page.locator(
    '[data-testid="password-input-wrapper"] input[type="password"]'
  )
  await passwordInput.fill(value)

  await page.click('body', { position: { x: 0, y: 0 } })
}

setup('authenticate', async ({ page }) => {
  console.log('Starting authentication process')

  // login
  await page.goto('/')
  console.log('Navigated to the home page')

  await page.waitForLoadState('networkidle')
  console.log('Page loaded')

  await page.click('[data-testid="header-login-signup-button"]')
  await page.waitForSelector('[data-testid="login-button"]', { state: 'visible' })
  console.log('Clicked login button and waiting for login form')

  await page.fill('[data-testid="email-input"]', 'test@gmail.com')
  console.log('Filled email input')

  await fillPasswordInput(page, 'password')
  console.log('Filled password input')

  await page.click('[data-testid="login-button"]')
  console.log('Submitted login form')

  // Wait for successful login and navigation to home page
  await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
  const toastContent = await page.locator('.p-toast-message').textContent()
  expect(toastContent).toContain('Logged in successfully')
  console.log('Received successful login message')

  await page.waitForURL('**/home', { timeout: 10000 })
  expect(page.url()).toContain('/home')
  console.log('Navigated to home page')

  // Save signed-in state to 'authFile'
  await page.context().storageState({ path: authFile })
  console.log('Saved authentication state to file')
})

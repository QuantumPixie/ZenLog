import { test, expect, Page } from '@playwright/test'

test.describe('Signup and Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  const fillPasswordInput = async (page: Page, value: string) => {
    await page.waitForSelector('[data-testid="password-input-wrapper"]', { state: 'visible' })
    await page.click('[data-testid="password-input-wrapper"]')

    const passwordInput = await page.locator(
      '[data-testid="password-input-wrapper"] input[type="password"]'
    )
    await passwordInput.fill(value)

    await page.click('body', { position: { x: 0, y: 0 } })
  }

  test('should navigate from landing page to login page and login successfully', async ({
    page
  }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="login-button"]', { state: 'visible' })

    await page.fill('[data-testid="email-input"]', 'test@gmail.com')
    await fillPasswordInput(page, 'password')

    await page.click('[data-testid="login-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Logged in successfully')

    await page.waitForURL('**/home', { timeout: 10000 })
    expect(page.url()).toContain('/home')
  })

  test('should navigate to signup page, create account, and redirect to home', async ({ page }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="create-account-link"]', { state: 'visible' })
    await page.click('[data-testid="create-account-link"]')
    await page.waitForSelector('[data-testid="signup-button"]', { state: 'visible' })

    const uniqueEmail = `test${Date.now()}@example.com`
    const uniqueUsername = `testuser${Date.now()}`

    await page.fill('[data-testid="username-input"]', uniqueUsername)
    await page.fill('[data-testid="email-input"]', uniqueEmail)
    await fillPasswordInput(page, 'password123')

    await page.click('[data-testid="signup-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Account created successfully')

    await page.waitForURL('**/home', { timeout: 10000 })
    expect(page.url()).toContain('/home')
  })

  test('should show error message for invalid login', async ({ page }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="login-button"]', { state: 'visible' })

    await page.fill('[data-testid="email-input"]', 'nonexistentuser@example.com')
    await fillPasswordInput(page, 'wrongpassword')

    await page.click('[data-testid="login-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Invalid email or password')
  })

  test('should navigate to signup page when clicking on "Create an account" link', async ({
    page
  }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="login-button"]', { state: 'visible' })

    await page.click('[data-testid="create-account-link"]')

    await expect(page.locator('[data-testid="signup-button"]')).toBeVisible()
  })

  test('should navigate back to login page from signup page', async ({ page }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="create-account-link"]', { state: 'visible' })
    await page.click('[data-testid="create-account-link"]')
    await page.waitForSelector('[data-testid="signup-button"]', { state: 'visible' })

    await page.click('[data-testid="create-account-link"]')

    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })
})

import { test, expect, Page } from '@playwright/test'
import { trpc } from '../src/utils/trpc' // Adjust this import path as necessary

const TEST_USER = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'testpassword123',
  username: `testuser_${Date.now()}`
}

async function createTestUser() {
  await trpc.user.signup.mutate(TEST_USER)
}

async function deleteTestUser() {
  await trpc.user.deleteUserByEmail.mutate({ email: TEST_USER.email })
}

const fillPasswordInput = async (page: Page, value: string) => {
  await page.waitForSelector('[data-testid="password-input-wrapper"]', { state: 'visible' })
  await page.click('[data-testid="password-input-wrapper"]')

  const passwordInput = await page.locator(
    '[data-testid="password-input-wrapper"] input[type="password"]'
  )
  await passwordInput.fill(value)

  await page.click('body', { position: { x: 0, y: 0 } })
}

test.describe('Signup and Login', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Starting test: navigating to home page')
    await page.goto('/', { timeout: 60000 })
    console.log('Waiting for network idle')
    await page.waitForLoadState('networkidle', { timeout: 60000 })
    console.log('Page loaded')
  })

  test.afterEach(async () => {
    await deleteTestUser().catch((error) => console.error('Error deleting test user:', error))
  })

  test('should navigate from landing page to login page', async ({ page }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible({ timeout: 30000 })
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
    await page.click('[data-testid="login-link"]')
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
  })

  test('should signup successfully with valid credentials', async ({ page }) => {
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="create-account-link"]', { state: 'visible' })
    await page.click('[data-testid="create-account-link"]')
    await page.waitForSelector('[data-testid="signup-button"]', { state: 'visible' })

    await page.fill('[data-testid="username-input"]', TEST_USER.username)
    await page.fill('[data-testid="email-input"]', TEST_USER.email)
    await fillPasswordInput(page, TEST_USER.password)

    await page.click('[data-testid="signup-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Account created successfully')

    await page.waitForURL('**/home', { timeout: 10000 })
    expect(page.url()).toContain('/home')
  })

  test('should show error for existing email during signup', async ({ page }) => {
    await createTestUser()

    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="create-account-link"]', { state: 'visible' })
    await page.click('[data-testid="create-account-link"]')
    await page.waitForSelector('[data-testid="signup-button"]', { state: 'visible' })

    await page.fill('[data-testid="username-input"]', 'newusername')
    await page.fill('[data-testid="email-input"]', TEST_USER.email)
    await fillPasswordInput(page, 'newpassword123')

    await page.click('[data-testid="signup-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Email already in use')
  })

  test('should login successfully with correct credentials', async ({ page }) => {
    await createTestUser()

    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="login-button"]', { state: 'visible', timeout: 30000 })

    await page.fill('[data-testid="email-input"]', TEST_USER.email)
    await fillPasswordInput(page, TEST_USER.password)

    await page.click('[data-testid="login-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Logged in successfully')

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

  test('should logout successfully', async ({ page }) => {
    await createTestUser()

    // Login
    await page.click('[data-testid="header-login-signup-button"]')
    await page.waitForSelector('[data-testid="login-button"]', { state: 'visible', timeout: 30000 })
    await page.fill('[data-testid="email-input"]', TEST_USER.email)
    await fillPasswordInput(page, TEST_USER.password)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('**/home', { timeout: 10000 })

    // Logout
    await page.click('[data-testid="logout-button"]')

    await expect(page.locator('.p-toast-message')).toBeVisible({ timeout: 10000 })
    const toastContent = await page.locator('.p-toast-message').textContent()
    expect(toastContent).toContain('Logged out successfully')

    await page.waitForURL('/', { timeout: 10000 })
    expect(page.url()).toBe('/')
  })
})

import { Page } from '@playwright/test'
import { trpc } from '../src/utils/trpc'

export const TEST_USER = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'testpassword123',
  username: `testuser_${Date.now()}`
}

export async function createTestUser() {
  console.log('Creating test user:', TEST_USER.email)
  await trpc.user.signup.mutate(TEST_USER)
  console.log('Test user created successfully')
}

export async function deleteTestUser() {
  console.log('Deleting test user:', TEST_USER.email)
  await trpc.user.deleteUserByEmail.mutate({ email: TEST_USER.email })
  console.log('Test user deleted successfully')
}

export async function loginTestUser(page: Page) {
  console.log('Starting login process...')
  await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 })
  console.log('Navigated to login page')

  await page.waitForSelector('[data-testid="email-input"]', { state: 'visible', timeout: 60000 })
  console.log('Email input found')

  await page.fill('[data-testid="email-input"]', TEST_USER.email)
  console.log('Filled email input')

  await page.fill('[data-testid="password-input"]', TEST_USER.password)
  console.log('Filled password input')

  await page.click('[data-testid="login-button"]')
  console.log('Clicked login button')

  await page.waitForURL('**/home', { timeout: 60000 })
  console.log('Navigated to home page')
}

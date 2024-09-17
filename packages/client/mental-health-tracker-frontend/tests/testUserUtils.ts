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
  console.log('Logging in test user:', TEST_USER.email)
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="email-input"]', { state: 'visible', timeout: 30000 })
  await page.fill('[data-testid="email-input"]', TEST_USER.email)
  await page.fill('[data-testid="password-input"]', TEST_USER.password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('**/home', { timeout: 30000 })
  console.log('Test user logged in successfully')
}

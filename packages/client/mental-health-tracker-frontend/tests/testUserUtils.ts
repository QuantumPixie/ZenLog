import { Page } from '@playwright/test'
import { trpc } from '../src/utils/trpc' // Adjust this import path as necessary

export const TEST_USER = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'testpassword123',
  username: `testuser_${Date.now()}`
}

export async function createTestUser() {
  await trpc.user.signup.mutate(TEST_USER)
}

export async function deleteTestUser() {
  await trpc.user.deleteUserByEmail.mutate({ email: TEST_USER.email })
}

export async function loginTestUser(page: Page) {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', TEST_USER.email)
  await page.fill('[data-testid="password-input"]', TEST_USER.password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('**/home')
}

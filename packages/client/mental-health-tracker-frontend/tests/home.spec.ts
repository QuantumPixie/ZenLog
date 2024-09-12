import { test, expect } from '@playwright/test'

test('Home page loads correctly and displays features', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.welcome-title')).toContainText('Welcome')
  const featureItems = await page.locator('.feature-item').all()
  expect(featureItems).toHaveLength(6)
})

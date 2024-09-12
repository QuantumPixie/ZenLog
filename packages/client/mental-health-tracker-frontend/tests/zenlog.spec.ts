import { test, expect } from '@playwright/test'

test('ZenLog page loads correctly', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('.welcome-title')).toContainText('Welcome to ZenLog')

  const featureItems = await page.locator('.feature-item').all()
  expect(featureItems).toHaveLength(6)

  await expect(page.locator('text=Sign Up')).toBeVisible()
  await expect(page.locator('text=Log In')).toBeVisible()
})

test('Feature dialog opens on click', async ({ page }) => {
  await page.goto('/')

  await page.click('.feature-item:first-child')

  await expect(page.locator('.feature-dialog')).toBeVisible()

  await expect(page.locator('.feature-dialog')).toContainText('Activity Tracking')
})

test('Navigation to signup page works', async ({ page }) => {
  await page.goto('/')

  await page.click('text=Sign Up')

  await expect(page).toHaveURL('/login-signup?mode=signup')
})

test('Navigation to login page works', async ({ page }) => {
  await page.goto('/')

  await page.click('text=Log In')

  await expect(page).toHaveURL('/login-signup?mode=login')
})

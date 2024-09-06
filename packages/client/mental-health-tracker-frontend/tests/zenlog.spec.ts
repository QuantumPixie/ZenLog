// tests/zenlog.spec.ts
import { test, expect } from '@playwright/test'

test('ZenLog page loads correctly', async ({ page }) => {
  await page.goto('/') // Assuming ZenLog is your landing page at '/'

  // Check if the welcome title is present
  await expect(page.locator('.welcome-title')).toContainText('Welcome to ZenLog')

  // Check if all feature items are present
  const featureItems = await page.locator('.feature-item').all()
  expect(featureItems).toHaveLength(6) // Assuming you have 6 feature items

  // Check if the CTA buttons are present
  await expect(page.locator('text=Sign Up')).toBeVisible()
  await expect(page.locator('text=Log In')).toBeVisible()
})

test('Feature dialog opens on click', async ({ page }) => {
  await page.goto('/')

  // Click on the first feature item
  await page.click('.feature-item:first-child')

  // Check if the dialog is visible
  await expect(page.locator('.feature-dialog')).toBeVisible()

  // Check if the dialog contains the correct content
  await expect(page.locator('.feature-dialog')).toContainText('Activity Tracking')
})

test('Navigation to signup page works', async ({ page }) => {
  await page.goto('/')

  // Click the Sign Up button
  await page.click('text=Sign Up')

  // Check if we've navigated to the signup page
  await expect(page).toHaveURL('/login-signup?mode=signup')
})

test('Navigation to login page works', async ({ page }) => {
  await page.goto('/')

  // Click the Log In button
  await page.click('text=Log In')

  // Check if we've navigated to the login page
  await expect(page).toHaveURL('/login-signup?mode=login')
})

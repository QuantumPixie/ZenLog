import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser } from './testUserUtils'

test.describe('ZenLog', () => {
  test.beforeAll(async () => {
    await createTestUser()
  })

  test.afterAll(async () => {
    await deleteTestUser()
  })

  test('ZenLog page loads correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    console.log('Navigated to ZenLog landing page')

    await expect(page.locator('.welcome-title')).toContainText('Welcome to ZenLog', {
      timeout: 30000
    })
    console.log('Welcome title is visible and correct')

    const featureItems = await page.locator('.feature-item').all()
    expect(featureItems).toHaveLength(6)
    console.log('Correct number of feature items displayed')

    await expect(page.locator('text=Sign Up')).toBeVisible({ timeout: 30000 })
    await expect(page.locator('text=Log In')).toBeVisible({ timeout: 30000 })
    console.log('Sign Up and Log In buttons are visible')
  })

  test('Feature dialog opens on click', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    console.log('Navigated to ZenLog landing page')

    await page.click('.feature-item:first-child')
    console.log('Clicked on first feature item')

    await expect(page.locator('.feature-dialog')).toBeVisible({ timeout: 30000 })
    console.log('Feature dialog is visible')

    await expect(page.locator('.feature-dialog')).toContainText('Activity Tracking', {
      timeout: 30000
    })
    console.log('Feature dialog contains correct content')
  })

  test('Navigation to signup page works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    console.log('Navigated to ZenLog landing page')

    await page.click('text=Sign Up')
    console.log('Clicked Sign Up button')

    await expect(page).toHaveURL('/login-signup?mode=signup', { timeout: 30000 })
    console.log('Navigated to signup page successfully')
  })

  test('Navigation to login page works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    console.log('Navigated to ZenLog landing page')

    await page.click('text=Log In')
    console.log('Clicked Log In button')

    await expect(page).toHaveURL('/login-signup?mode=login', { timeout: 30000 })
    console.log('Navigated to login page successfully')
  })
})

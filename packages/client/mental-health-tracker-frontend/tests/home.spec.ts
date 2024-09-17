import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, loginTestUser } from './testUserUtils'

test.describe('Home', () => {
  test.beforeAll(async () => {
    await createTestUser()
  })

  test.afterAll(async () => {
    await deleteTestUser()
  })

  test('Home page loads correctly and displays features', async ({ page }) => {
    await loginTestUser(page)

    console.log('Starting home page test')

    await page.goto('/home', { waitUntil: 'networkidle' })
    console.log('Navigated to home page')

    await page.waitForLoadState('networkidle')
    console.log('Page load state: networkidle')

    const welcomeTitle = page.locator('.welcome-title')
    await expect(welcomeTitle).toBeVisible({ timeout: 30000 })
    console.log('Welcome title is visible')

    const welcomeText = await welcomeTitle.textContent()
    console.log('Welcome title text:', welcomeText)

    expect(welcomeText).toContain('Welcome')

    const featureItems = await page.locator('.feature-item').all()
    console.log('Number of feature items:', featureItems.length)
    expect(featureItems).toHaveLength(6)

    // Check for specific features
    const expectedFeatures = [
      'Mood Tracking',
      'Journal',
      'Activity Log',
      'Dashboard',
      'Reports',
      'Settings'
    ]
    for (const feature of expectedFeatures) {
      await expect(page.locator(`.feature-item:has-text("${feature}")`)).toBeVisible({
        timeout: 30000
      })
    }

    console.log('All expected features are visible')

    // Check if the logout button is present
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible({ timeout: 30000 })
    console.log('Logout button is visible')

    console.log('Home page test completed successfully')
  })
})

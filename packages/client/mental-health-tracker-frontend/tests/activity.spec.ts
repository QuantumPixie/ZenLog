import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, loginTestUser } from './testUserUtils'

test.describe('Activity', () => {
  test.beforeAll(async () => {
    await createTestUser()
  })

  test.afterAll(async () => {
    await deleteTestUser()
  })

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page)
  })

  test('Activity logging functionality', async ({ page }) => {
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

    await page.goto('/activities', { waitUntil: 'networkidle' })
    console.log('Navigated to activities page')

    await page.waitForSelector('.activity-item', { state: 'attached', timeout: 30000 })

    const initialActivityCount = await page.locator('.activity-item').count()
    console.log(`Initial activity count: ${initialActivityCount}`)

    await page.waitForSelector('#activity', { state: 'visible', timeout: 30000 })
    console.log('Activity input is visible')

    const activityName = 'Running'
    await page.locator('#activity').fill(activityName)
    console.log('Filled activity name')

    await page.locator('#duration input').fill('30')
    console.log('Filled duration')

    const activityNotes = 'Evening run in the park'
    await page.locator('#notes').fill(activityNotes)
    console.log('Filled notes')

    const logActivityButton = page.getByRole('button', { name: 'Log Activity' })
    await logActivityButton.click()
    console.log('Clicked Log Activity button')

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/trpc/activity.createActivity') && response.status() === 200
    )
    console.log('Activity creation API call completed')

    await page.waitForSelector('.activity-item', { state: 'attached', timeout: 30000 })

    const newActivityCount = await page.locator('.activity-item').count()
    console.log(`New activity count: ${newActivityCount}`)
    expect(newActivityCount).toBeGreaterThan(initialActivityCount)

    const latestActivity = page.locator('.activity-item').first()

    await expect(latestActivity.locator('p strong')).toContainText(activityName, { timeout: 30000 })
    await expect(latestActivity.locator('p').nth(1)).toContainText('Duration: 30 minutes', {
      timeout: 30000
    })
    await expect(latestActivity.locator('p').nth(2)).toContainText(activityNotes, {
      timeout: 30000
    })

    console.log('Verified logged activity in the list')

    await expect(page.locator('#activity')).toHaveValue('', { timeout: 30000 })
    await expect(page.locator('#duration input')).toHaveValue('', { timeout: 30000 })
    await expect(page.locator('#notes')).toHaveValue('', { timeout: 30000 })

    console.log('Verified input fields are cleared')
  })
})

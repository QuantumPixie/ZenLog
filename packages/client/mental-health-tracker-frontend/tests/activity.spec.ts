import { test, expect } from '@playwright/test'

test.describe('Activity', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('New user activity logging functionality', async ({ page }) => {
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

    try {
      await page.goto('/activities', { waitUntil: 'networkidle' })
      console.log('Navigated to activities page')

      // Verify that no activity items are initially present for the new user
      const initialActivityCount = await page.locator('.activity-item').count()
      console.log(`Initial activity count: ${initialActivityCount}`)
      expect(initialActivityCount).toBe(0) // Expect no activities for a new user

      // Log a new activity
      await page.waitForSelector('#activity', { state: 'visible', timeout: 30000 })
      console.log('Activity input is visible')

      const activityName = 'Running'
      const activityDuration = '30'
      const activityNotes = 'Evening run in the park'

      await page.locator('#activity').fill(activityName)
      console.log('Filled activity name')

      await page.locator('#duration input').fill(activityDuration)
      console.log('Filled duration')

      await page.locator('#notes').fill(activityNotes)
      console.log('Filled notes')

      // Log the activity
      const logActivityButton = page.getByRole('button', { name: 'Log Activity' })
      await logActivityButton.click()
      console.log('Clicked Log Activity button')

      // Wait for the API call to complete successfully
      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/trpc/activity.createActivity') && response.status() === 200
      )
      console.log('Activity creation API call completed')

      // Verify that the activity has been added to the list
      await page.waitForSelector('.activity-item', { state: 'attached', timeout: 30000 })
      const newActivityCount = await page.locator('.activity-item').count()
      console.log(`New activity count: ${newActivityCount}`)
      expect(newActivityCount).toBe(1) // Expect exactly one activity

      const latestActivity = page.locator('.activity-item').first()

      await expect(latestActivity.locator('p strong')).toContainText(activityName, {
        timeout: 30000
      })
      await expect(latestActivity.locator('p').nth(1)).toContainText(
        `Duration: ${activityDuration} minutes`,
        { timeout: 30000 }
      )
      await expect(latestActivity.locator('p').nth(2)).toContainText(activityNotes, {
        timeout: 30000
      })

      console.log('Verified logged activity in the list')

      // Verify that input fields are cleared after logging the activity
      await expect(page.locator('#activity')).toHaveValue('')
      await expect(page.locator('#duration input')).toHaveValue('')
      await expect(page.locator('#notes')).toHaveValue('')

      console.log('Verified input fields are cleared')
    } catch (error) {
      console.error('Test failed:', error)
      await page.screenshot({ path: 'activity-test-failure.png' })
      throw error
    }
  })
})

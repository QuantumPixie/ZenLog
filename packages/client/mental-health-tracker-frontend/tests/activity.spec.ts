import { test, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

test.use({ storageState: authFile })

test('Activity logging functionality', async ({ page }) => {
  page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

  await page.goto('/activities')
  console.log('Navigated to activities page')

  // wait for activities to load
  await page.waitForSelector('.activity-item', { state: 'attached', timeout: 10000 })

  // get initial activity count
  const initialActivityCount = await page.locator('.activity-item').count()
  console.log(`Initial activity count: ${initialActivityCount}`)

  // log a new activity
  await page.waitForSelector('#activity', { state: 'visible', timeout: 10000 })
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

  // wait for UI updates
  await page.waitForTimeout(2000)

  // verify new activity has been added
  const newActivityCount = await page.locator('.activity-item').count()
  console.log(`New activity count: ${newActivityCount}`)
  expect(newActivityCount).toBeGreaterThan(initialActivityCount)

  // check the content of most recent activity
  const latestActivity = page.locator('.activity-item').first()

  // activity name
  await expect(latestActivity.locator('p strong')).toContainText(activityName)

  // duration
  await expect(latestActivity.locator('p').nth(1)).toContainText('Duration: 30 minutes')

  // notes
  await expect(latestActivity.locator('p').nth(2)).toContainText(activityNotes)

  console.log('Verified logged activity in the list')

  // input fields cleared after logging
  await expect(page.locator('#activity')).toHaveValue('')
  await expect(page.locator('#duration input')).toHaveValue('')
  await expect(page.locator('#notes')).toHaveValue('')

  console.log('Verified input fields are cleared')
})

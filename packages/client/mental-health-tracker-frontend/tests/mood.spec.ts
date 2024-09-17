import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, loginTestUser } from './testUserUtils'

test.describe('Mood', () => {
  test.beforeAll(async () => {
    await createTestUser()
  })

  test.afterAll(async () => {
    await deleteTestUser()
  })

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page)
  })

  test('Mood logging functionality', async ({ page }) => {
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

    await page.goto('/mood', { waitUntil: 'networkidle' })
    console.log('Navigated to mood page')

    await page.waitForSelector('.mood-item', { state: 'attached', timeout: 30000 })

    const initialMoodCount = await page.locator('.mood-item').count()
    console.log(`Initial mood count: ${initialMoodCount}`)

    await page.waitForSelector('#mood_score', { state: 'visible', timeout: 30000 })
    console.log('Mood score input is visible')

    await page.locator('#mood_score input').fill('8')
    console.log('Filled mood score')

    await page.locator('.p-multiselect').click()
    console.log('Clicked multiselect')

    await page.locator('.p-multiselect-item:has-text("Happy")').click()
    await page.locator('.p-multiselect-item:has-text("Excited")').click()
    console.log('Selected emotions')

    await page.click('body', { position: { x: 0, y: 0 } })
    console.log('Clicked outside multi-select')

    const selectedEmotions = await page.locator('.p-multiselect-token-label').allTextContents()
    console.log('Selected emotions:', selectedEmotions)
    expect(selectedEmotions).toContain('Happy')
    expect(selectedEmotions).toContain('Excited')

    await page.waitForSelector('button:has-text("Log Mood")', { state: 'visible', timeout: 30000 })

    const logMoodButton = page.locator('button:has-text("Log Mood")')
    await logMoodButton.click()
    console.log('Clicked Log Mood button')

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/trpc/mood.createMood') && response.status() === 200
    )
    console.log('Mood creation API call completed')

    await expect(page.locator('.p-toast-message-content')).toContainText(
      'Mood logged successfully',
      { timeout: 30000 }
    )
    console.log('Success message appeared')

    await page.waitForSelector('.mood-item', { state: 'attached', timeout: 30000 })

    const newMoodCount = await page.locator('.mood-item').count()
    console.log(`New mood count: ${newMoodCount}`)
    expect(newMoodCount).toBeGreaterThan(initialMoodCount)

    const latestMoodItem = page.locator('.mood-item').first()

    await expect(latestMoodItem.locator('p:has-text("Score:")')).toContainText('Score: 8', {
      timeout: 30000
    })
    await expect(latestMoodItem.locator('p:has-text("Emotions:")')).toContainText(
      'Emotions: Happy, Excited',
      { timeout: 30000 }
    )

    console.log('Verified logged mood in the list')

    const moodScoreInput = page.locator('#mood_score input')
    await expect(moodScoreInput).toHaveValue('', { timeout: 30000 })

    const emotionsInput = page.locator('.p-multiselect-label')
    await expect(emotionsInput).toContainText('Select Emotions', { timeout: 30000 })

    console.log('Verified input fields are cleared')
  })
})

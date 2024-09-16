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

    await page.goto('/mood')
    console.log('Navigated to mood page')

    // load moods
    await page.waitForSelector('.mood-item', { state: 'attached', timeout: 10000 })

    const initialMoodCount = await page.locator('.mood-item').count()
    console.log(`Initial mood count: ${initialMoodCount}`)

    // log a new mood
    await page.waitForSelector('#mood_score', { state: 'visible', timeout: 10000 })
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

    await page.waitForSelector('button:has-text("Log Mood")', { state: 'visible', timeout: 5000 })

    const logMoodButton = page.locator('button:has-text("Log Mood")')
    await logMoodButton.click()
    console.log('Clicked Log Mood button')

    // success message
    await expect(page.locator('.p-toast-message-content')).toContainText(
      'Mood logged successfully',
      {
        timeout: 10000
      }
    )
    console.log('Success message appeared')

    await page.waitForTimeout(2000) // Give some time for the UI to update moods

    const newMoodCount = await page.locator('.mood-item').count()
    console.log(`New mood count: ${newMoodCount}`)
    expect(newMoodCount).toBeGreaterThan(initialMoodCount)

    const latestMoodItem = page.locator('.mood-item').first()

    await expect(latestMoodItem.locator('p:has-text("Score:")')).toContainText('Score: 8')

    await expect(latestMoodItem.locator('p:has-text("Emotions:")')).toContainText(
      'Emotions: Happy, Excited'
    )

    console.log('Verified logged mood in the list')

    // clearing input fields are cleared after logging
    const moodScoreInput = page.locator('#mood_score input')
    await expect(moodScoreInput).toHaveValue('')

    const emotionsInput = page.locator('.p-multiselect-label')
    await expect(emotionsInput).toContainText('Select Emotions')

    console.log('Verified input fields are cleared')
  })
})

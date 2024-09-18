import { test, expect } from '@playwright/test'

test.describe('Mood', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('Mood logging functionality', async ({ page }) => {
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

    try {
      await page.goto('/mood')
      console.log('Navigated to mood page')

      // Log a new mood
      console.log('Logging a new mood')
      await page.waitForSelector('#mood_score', { state: 'visible', timeout: 5000 })
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

      // Wait for success message
      await expect(page.locator('.p-toast-message-content')).toContainText(
        'Mood logged successfully',
        {
          timeout: 10000
        }
      )
      console.log('Success message appeared')

      // Wait for the mood item to appear
      await page.waitForSelector('.mood-item', { state: 'visible', timeout: 10000 })
      console.log('Mood item appeared')

      const moodItems = await page.$$('.mood-item')
      console.log(`Number of mood items: ${moodItems.length}`)
      expect(moodItems.length).toBeGreaterThan(0)

      const latestMoodItem = page.locator('.mood-item').first()

      await expect(latestMoodItem.locator('p:has-text("Score:")')).toContainText('Score: 8')

      await expect(latestMoodItem.locator('p:has-text("Emotions:")')).toContainText(
        'Emotions: Happy, Excited'
      )

      console.log('Verified logged mood in the list')

      // Clearing input fields after logging
      const moodScoreInput = page.locator('#mood_score input')
      await expect(moodScoreInput).toHaveValue('')

      const emotionsInput = page.locator('.p-multiselect-label')
      await expect(emotionsInput).toContainText('Select Emotions')

      console.log('Verified input fields are cleared')
    } catch (error) {
      console.error('Test failed:', error)
      await page.screenshot({ path: 'mood-test-failure.png' })
      throw error
    }
  })
})

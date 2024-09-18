import { test, expect } from '@playwright/test'

test.describe('Journal', () => {
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('Journal entry creation and verification', async ({ page }) => {
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

    try {
      await page.goto('/journal')
      console.log('Navigated to journal page')

      // Since the user is new and hasn't logged any entries, directly create a new journal entry
      const testEntry = 'This is a test journal entry created at ' + new Date().toISOString()

      // Wait for journal entry input field to be visible
      await page.waitForSelector('#entry', { state: 'visible', timeout: 30000 })
      console.log('Journal entry input is visible')

      // Fill in the journal entry
      await page.locator('#entry').fill(testEntry)
      console.log('Filled journal entry')

      // Click on the "Save Entry" button
      const saveButton = page.getByRole('button', { name: 'Save Entry' })
      await saveButton.click()
      console.log('Clicked Save Entry button')

      // Wait for the success message indicating the entry was saved
      await expect(page.locator('.p-toast-message-content')).toContainText(
        'Journal entry created',
        {
          timeout: 30000
        }
      )
      console.log('Success message appeared')

      // Verify that the new journal entry appears in the list
      await page.waitForSelector('.journal-item', { state: 'attached', timeout: 30000 })
      const newEntryCount = await page.locator('.journal-item').count()
      console.log(`New journal entry count: ${newEntryCount}`)
      expect(newEntryCount).toBeGreaterThan(0) // At least one entry should now exist

      // Verify the content of the most recent journal entry
      const latestEntry = page.locator('.journal-item').first()
      await expect(latestEntry.locator('p').nth(1)).toContainText(testEntry.substring(0, 150), {
        timeout: 30000
      })
      console.log('Verified logged journal entry in the list')

      // Verify that the input field is cleared after saving
      const entryInput = page.locator('#entry')
      await expect(entryInput).toHaveValue('')
      console.log('Verified input field is cleared')
    } catch (error) {
      console.error('Test failed:', error)
      await page.screenshot({ path: 'journal-test-failure.png' })
      throw error
    }
  })
})

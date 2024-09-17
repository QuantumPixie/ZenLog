import { test, expect } from '@playwright/test'
import { createTestUser, deleteTestUser, loginTestUser } from './testUserUtils'

test.describe('Journal', () => {
  test.beforeAll(async () => {
    await createTestUser()
  })

  test.afterAll(async () => {
    await deleteTestUser()
  })

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page)
  })

  test('Journal entry creation and verification', async ({ page }) => {
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`))

    await page.goto('/journal', { waitUntil: 'networkidle' })
    console.log('Navigated to journal page')

    await page.waitForSelector('.journal-item', { state: 'attached', timeout: 30000 })

    const initialEntryCount = await page.locator('.journal-item').count()
    console.log(`Initial journal entry count: ${initialEntryCount}`)

    await page.waitForSelector('#entry', { state: 'visible', timeout: 30000 })
    console.log('Journal entry input is visible')

    const testEntry = 'This is a test journal entry created at ' + new Date().toISOString()
    await page.locator('#entry').fill(testEntry)
    console.log('Filled journal entry')

    const saveButton = page.getByRole('button', { name: 'Save Entry' })
    await saveButton.click()
    console.log('Clicked Save Entry button')

    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/trpc/journalEntry.createJournalEntry') &&
        response.status() === 200
    )
    console.log('Journal entry creation API call completed')

    await expect(page.locator('.p-toast-message-content')).toContainText('Journal entry created', {
      timeout: 30000
    })
    console.log('Success message appeared')

    await page.waitForSelector('.journal-item', { state: 'attached', timeout: 30000 })

    const newEntryCount = await page.locator('.journal-item').count()
    console.log(`New journal entry count: ${newEntryCount}`)
    expect(newEntryCount).toBeGreaterThan(initialEntryCount)

    const latestEntry = page.locator('.journal-item').first()

    await expect(latestEntry.locator('p').nth(1)).toContainText(testEntry.substring(0, 150), {
      timeout: 30000
    })

    console.log('Verified logged journal entry in the list')

    const entryInput = page.locator('#entry')
    await expect(entryInput).toHaveValue('', { timeout: 30000 })

    console.log('Verified input field is cleared')
  })
})

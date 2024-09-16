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

    await page.goto('/journal')
    console.log('Navigated to journal page')

    // load entries
    await page.waitForSelector('.journal-item', { state: 'attached', timeout: 10000 })

    // get inital count
    const initialEntryCount = await page.locator('.journal-item').count()
    console.log(`Initial journal entry count: ${initialEntryCount}`)

    // create new entry
    await page.waitForSelector('#entry', { state: 'visible', timeout: 10000 })
    console.log('Journal entry input is visible')

    const testEntry = 'This is a test journal entry created at ' + new Date().toISOString()
    await page.locator('#entry').fill(testEntry)
    console.log('Filled journal entry')

    const saveButton = page.getByRole('button', { name: 'Save Entry' })
    await saveButton.click()
    console.log('Clicked Save Entry button')

    // success message
    await expect(page.locator('.p-toast-message-content')).toContainText('Journal entry created', {
      timeout: 10000
    })
    console.log('Success message appeared')

    // time for the UI to update
    await page.waitForTimeout(2000)

    // new journal entry added
    const newEntryCount = await page.locator('.journal-item').count()
    console.log(`New journal entry count: ${newEntryCount}`)
    expect(newEntryCount).toBeGreaterThan(initialEntryCount)

    // content of the most recent journal entry
    const latestEntry = page.locator('.journal-item').first()

    // Verify content
    await expect(latestEntry.locator('p').nth(1)).toContainText(testEntry.substring(0, 150))

    console.log('Verified logged journal entry in the list')

    // input field is cleared after saving
    const entryInput = page.locator('#entry')
    await expect(entryInput).toHaveValue('')

    console.log('Verified input field is cleared')
  })
})

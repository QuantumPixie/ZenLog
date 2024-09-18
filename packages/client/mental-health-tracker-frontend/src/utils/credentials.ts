import { chromium } from 'playwright'

export async function generateTestCredentials(): Promise<{ email: string; password: string }> {
  const uniqueEmail = `test${Date.now()}@example.com`
  const uniquePassword = `password${Date.now()}`

  const browser = await chromium.launch()
  const context = await browser.newContext()

  await context.storageState({
    path: 'playwright/.auth/test_credentials.json'
  })

  await browser.close()

  return { email: uniqueEmail, password: uniquePassword }
}

export async function getTestCredentials(): Promise<{ email: string; password: string }> {
  try {
    const browser = await chromium.launch()
    const context = await browser.newContext()

    const state = await context.storageState()
    if (!state) throw new Error('No credentials found')

    await browser.close()

    return state as unknown as { email: string; password: string }
  } catch (error) {
    console.warn('No existing test credentials found. Generating new ones.')
    return await generateTestCredentials()
  }
}

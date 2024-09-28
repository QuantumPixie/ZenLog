import { describe, it, vi, expect } from 'vitest'
import { config } from 'dotenv'

vi.mock('dotenv', () => ({
  config: vi.fn(),
}))

describe('index.ts', () => {
  it('should load environment variables and import the server', async () => {
    // mock for dynamic import
    const serverMock = {}
    vi.mock('../src/server.js', () => Promise.resolve(serverMock))

    const indexModule = await import('../../src/index')

    // dotenv.config is called with the correct path
    expect(config).toHaveBeenCalledWith({
      path: expect.stringMatching(/\.env$/),
    })

    // check if the module was resolved correctly
    expect(indexModule).toBeDefined()
  })
})

import path from 'path'
import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  test: {
    maxConcurrency: 1,
    sequence: {
      shuffle: false,
    },
    hookTimeout: 20000,
    testTimeout: 10000,
    globals: true,
    environment: 'node',
    setupFiles: [path.resolve(__dirname, './testSetup.ts')],
    include: ['src/**/*.test.ts', 'src/tests/**/*.test.ts'],
    alias: {
      '@server': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      '@': path.resolve(__dirname, './src'),
    },
    env: {
      NODE_ENV: 'test',
    },
  },
})

import path from 'path'
import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  test: {
    setupFiles: ['./src/__tests__/integration/transactions/testSetup.ts'],
    coverage: {
      exclude: [
        '**/types/**',
        '**/models/**',
        '**/config.ts',
        '**/__tests__/**',
        './vitest.config.ts',
      ],
    },
    maxConcurrency: 1,
    sequence: {
      shuffle: false,
    },
    hookTimeout: 50000,
    testTimeout: 20000,
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/tests/**/*.test.ts'],
    alias: {
      '@server': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './src/__tests__'),
      '@': path.resolve(__dirname, './src'),
    },
    env: {
      NODE_ENV: 'test',
    },
  },
})

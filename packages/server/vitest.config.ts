import path from 'path'
import { defineConfig } from 'vitest/config'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

export default defineConfig({
  test: {
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
      concurrent: false,
    },
    hookTimeout: 20000,
    testTimeout: 10000,
    globals: true,
    environment: 'node',
    setupFiles: [path.resolve(__dirname, './testSetup.ts')],
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

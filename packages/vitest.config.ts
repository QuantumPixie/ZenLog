import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    hookTimeout: 20000,
    testTimeout: 10000,
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
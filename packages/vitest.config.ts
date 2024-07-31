import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    hookTimeout: 20000,
    testTimeout: 10000,
    globals: true,
    environment: 'node',
    setupFiles: ['dotenv/config'],
    include: [ 'src/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
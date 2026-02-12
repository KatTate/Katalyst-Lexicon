import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  test: {
    globals: true,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});

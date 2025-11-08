import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../types'),
    },
  },
  test: {
    environment: 'node',
    onConsoleLog(log, type) {
      if (type === 'stderr') {
        return false;
      }
    },
  },
});

import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

dotenv.config({ path: './.env.gateway.test' });

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./tests/_support/setup.ts'],
    fileParallelism: true,
    isolate: true,
    pool: 'forks',
    maxWorkers: 4,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});

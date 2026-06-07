import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // Pin a positive-offset timezone so the gcFired() local-vs-UTC regression
    // test exercises the real near-midnight boundary the bug occurred at.
    env: { TZ: 'Africa/Cairo' },
    setupFiles: ['./vitest.setup.ts'],
    include: ['lib/**/*.test.ts', 'tests/**/*.test.ts', 'app/**/*.test.ts', 'components/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['lib/task-state.ts', 'lib/media-store.ts', 'lib/reminders.ts'],
      reporter: ['text', 'text-summary'],
    },
  },
})

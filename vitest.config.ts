import { defineConfig } from 'vitest/config'

// Konfig tempatan supaya Vitest tidak "walk up" ke fail vite.config di luar projek.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})

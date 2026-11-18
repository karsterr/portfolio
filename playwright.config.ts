import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: process.env.PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173',
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined },
    trace: 'retain-on-failure',
  },
  webServer: [
    ...(process.env.PORTFOLIO_BASE_URL ? [] : [{ command: 'node scripts/astro.ts preview --config astro.config.mjs --host 127.0.0.1 --port 4173 --ignore-lock', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }]),
    { command: 'node scripts/astro.ts dev --config astro.admin.config.mjs --port 4322 --ignore-lock', url: 'http://127.0.0.1:4322/keystatic/', reuseExistingServer: !process.env.CI, env: { PUBLIC_CMS_STORAGE: 'local' } },
  ],
});

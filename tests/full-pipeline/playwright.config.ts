import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src',
  testMatch: /.*\.spec\.ts/,
  timeout: 1_200_000,
  expect: { timeout: 30_000 },
  retries: 0,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: [
    {
      command: 'pnpm --filter sesap-admin dev',
      cwd: '../..',
      url: 'http://127.0.0.1:8787/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter sesap-showcase dev',
      cwd: '../..',
      url: 'http://127.0.0.1:8790/api/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter sesap-admin-ui dev',
      cwd: '../..',
      port: 3001,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter survey-static-generator dev',
      cwd: '../..',
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});

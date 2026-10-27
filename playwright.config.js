import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.js/,
  timeout: 90_000,
  retries: 0,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4187', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4187 --strictPort',
    url: 'http://127.0.0.1:4187',
    // Never reuse: another repo's preview server on a shared port would be tested by mistake.
    reuseExistingServer: false,
    // Server start-up only (not test time): generous because other repos' test runs share this machine.
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  outputDir: 'tmp/test-results',
});

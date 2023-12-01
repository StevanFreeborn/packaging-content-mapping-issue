import { defineConfig, devices } from '@playwright/test';
import './env';

export const SOURCE_INSTANCE_AUTH_PATH = `.auth/source.json`;
export const TARGET_INSTANCE_AUTH_PATH = `.auth/target.json`;

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  workers: 1,
  reporter: 'html',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '*.setup.ts',
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '*.test.ts',
      dependencies: ['setup'],
    },
  ],
});

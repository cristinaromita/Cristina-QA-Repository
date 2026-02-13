import { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: './features',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  retries: process.env.CI ? 2 : 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    headless: process.env.HEADLESS === 'true',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome'
      }
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox'
      }
    },
    {
      name: 'webkit',
      use: {
        browserName: 'webkit'
      }
    }
  ]
};

export default config;

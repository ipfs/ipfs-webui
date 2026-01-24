import { defineConfig } from '@playwright/test'

const webuiPort = 3001

/** @type {import('@playwright/test').Config} */
const config = {
  testDir: './',
  timeout: 30 * 1000,
  globalTimeout: 5 * 60 * 1000, // 5 minutes max for entire test suite including setup
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: process.env.DEBUG ? 1 : undefined,
  reporter: 'list',
  use: {
    headless: !process.env.DEBUG,
    viewport: { width: 1366, height: 768 },
    baseURL: `http://localhost:${webuiPort}/`,
    storageState: 'test/e2e/state.json',
    trace: 'retain-on-failure'
  },
  /* TODO: test against other engines?
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
  */
  globalSetup: './setup/global-setup.js',
  globalTeardown: './setup/global-teardown.js',
  webServer: [
    {
      command: `npx http-server ./build/ -c-1 -a 127.0.0.1 -p ${webuiPort}`,
      timeout: 5 * 1000,
      url: `http://localhost:${webuiPort}/`,
      cwd: '../../',
      reuseExistingServer: false,
      env: {
        REACT_APP_ENV: 'test',
        NODE_ENV: 'test',
        PORT: webuiPort
      }
    }
  ],
  collectCoverage: true,
  coverageConfig: {
    include: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.stories.{js,jsx,ts,tsx}'
    ]
  }
}

export default defineConfig(config)

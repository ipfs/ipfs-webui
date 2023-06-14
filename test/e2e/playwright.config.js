// const { devices } = require('@playwright/test')
import { defineConfig } from '@playwright/test'

const webuiPort = 3001
const rpcPort = 55001

/** @type {import('@playwright/test').Config} */
const config = {
  testDir: './',
  timeout: process.env.CI ? 90 * 1000 : 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: (process.env.DEBUG || process.env.CI) ? 1 : undefined,
  reuseExistingServer: !process.env.CI,
  reporter: 'list',
  use: {
    headless: !process.env.DEBUG,
    viewport: { width: 1366, height: 768 },
    baseURL: `http://localhost:${webuiPort}/`,
    storageState: 'test/e2e/state.json',
    trace: 'on-first-retry'
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
      command: `node ipfs-backend.js ${rpcPort}`,
      timeout: 5 * 1000,
      port: rpcPort,
      cwd: './setup',
      reuseExistingServer: !process.env.CI
    },
    {
      command: `npx http-server ./build/ -c-1 -a 127.0.0.1 -p ${webuiPort}`,
      timeout: 5 * 1000,
      url: `http://localhost:${webuiPort}/`,
      cwd: '../../',
      reuseExistingServer: !process.env.CI,
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

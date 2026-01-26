import { defineConfig } from '@playwright/test'

const webuiPort = 3001

/** @type {import('@playwright/test').Config} */
const config = {
  testDir: './',
  timeout: 30 * 1000,
  globalTimeout: 5 * 60 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.DEBUG ? 1 : undefined,
  reporter: 'list',
  use: {
    headless: !process.env.DEBUG,
    viewport: { width: 1920, height: 1080 },
    baseURL: `http://127.0.0.1:${webuiPort}/`,
    storageState: 'test/e2e/state.json',
    trace: 'retain-on-failure'
  },
  globalSetup: './setup/global-setup.js',
  globalTeardown: './setup/global-teardown.js',
  webServer: [
    {
      command: `npx http-server ./build/ -c-1 -a 127.0.0.1 -p ${webuiPort}`,
      timeout: 30 * 1000,
      url: `http://127.0.0.1:${webuiPort}/`,
      cwd: '../../',
      reuseExistingServer: false
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

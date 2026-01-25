import { defineConfig } from '@playwright/test'

// Allow port override via environment variable for CI flexibility
// Falls back to 3001 if not set
const webuiPort = process.env.WEBUI_PORT || 3001

console.error(`[playwright.config.js] webuiPort=${webuiPort}`)
console.error(`[playwright.config.js] cwd=${process.cwd()}`)

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
    baseURL: `http://127.0.0.1:${webuiPort}/`,
    storageState: 'test/e2e/state.json',
    trace: 'retain-on-failure'
  },
  globalSetup: './setup/global-setup.js',
  globalTeardown: './setup/global-teardown.js',
  webServer: [
    {
      command: `node -e "console.error('[http-server] Starting on port ${webuiPort}...')" && npx http-server ./build/ -c-1 -a 127.0.0.1 -p ${webuiPort}`,
      timeout: 30 * 1000, // increased from 5s to 30s for CI
      url: `http://127.0.0.1:${webuiPort}/`,
      cwd: '../../',
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        REACT_APP_ENV: 'test',
        NODE_ENV: 'test'
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

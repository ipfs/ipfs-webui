import { defineConfig } from '@playwright/test'
import { writeSync } from 'node:fs'

// Force synchronous logging that bypasses Node.js buffering
const log = (msg) => {
  const line = `[playwright.config.js] ${msg}\n`
  writeSync(1, line) // stdout fd=1
  writeSync(2, line) // stderr fd=2
}

// Allow port override via environment variable for CI flexibility
// Falls back to 3001 if not set
const webuiPort = process.env.WEBUI_PORT || 3001

log('Loading config...')
log(`webuiPort=${webuiPort}`)
log(`cwd=${process.cwd()}`)
log(`NODE_ENV=${process.env.NODE_ENV}`)
log(`REACT_APP_ENV=${process.env.REACT_APP_ENV}`)

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
  globalSetup: process.env.SKIP_GLOBAL_SETUP ? undefined : './setup/global-setup.js',
  globalTeardown: process.env.SKIP_GLOBAL_SETUP ? undefined : './setup/global-teardown.js',
  // On CI, we start the server externally, so skip webServer entirely
  webServer: process.env.CI ? [] : [
    {
      command: 'node ./setup/serve-build.js',
      timeout: 30 * 1000,
      url: `http://127.0.0.1:${webuiPort}/`,
      reuseExistingServer: false,
      stdout: 'inherit',
      stderr: 'inherit',
      env: {
        ...process.env,
        WEBUI_PORT: String(webuiPort)
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

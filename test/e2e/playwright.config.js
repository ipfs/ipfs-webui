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

log(`Loading config...`)
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

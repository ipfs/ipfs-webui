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
  globalSetup: './setup/global-setup.js',
  globalTeardown: './setup/global-teardown.js',
  webServer: [
    {
      // Use node directly instead of npx http-server to avoid npx hanging issues
      command: `node -e "
        const http = require('http');
        const fs = require('fs');
        const path = require('path');
        const mimeTypes = {
          '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
          '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
          '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2'
        };
        const server = http.createServer((req, res) => {
          let filePath = './build' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]);
          const ext = path.extname(filePath);
          fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end('Not found'); return; }
            res.writeHead(200, {'Content-Type': mimeTypes[ext] || 'application/octet-stream'});
            res.end(data);
          });
        });
        server.listen(${webuiPort}, '127.0.0.1', () => console.error('[server] Listening on port ${webuiPort}'));
      "`,
      timeout: 30 * 1000,
      url: `http://127.0.0.1:${webuiPort}/`,
      cwd: '../../',
      reuseExistingServer: false,
      stdout: 'pipe',
      stderr: 'pipe'
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

#!/usr/bin/env node
// Simple static file server for e2e tests
// Avoids npx http-server which hangs on CI

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const port = process.env.WEBUI_PORT || 3001
const buildDir = path.join(__dirname, '../../../build')

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json'
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]
  if (urlPath === '/') urlPath = '/index.html'

  const filePath = path.join(buildDir, urlPath)
  const ext = path.extname(filePath)

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found: ' + urlPath)
      return
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(port, '127.0.0.1', () => {
  // Write to stderr so it's captured by playwright webServer
  process.stderr.write(`[serve-build] Server listening on http://127.0.0.1:${port}\n`)
  process.stderr.write(`[serve-build] Serving files from ${buildDir}\n`)
})

server.on('error', (err) => {
  process.stderr.write(`[serve-build] Server error: ${err.message}\n`)
  process.exit(1)
})

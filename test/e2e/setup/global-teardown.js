import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import { stop } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// log to both stdout and stderr to ensure CI captures output regardless of buffering
const log = (msg) => {
  const line = `[${new Date().toISOString()}] [global-teardown] ${msg}\n`
  process.stdout.write(line)
  process.stderr.write(line)
}

const globalTeardown = async (config) => {
  log('=== GLOBAL TEARDOWN STARTING ===')

  // Stop the Kubo daemon properly
  try {
    log('Calling ipfs-backend stop()...')
    await stop()
    log('ipfs-backend stop() completed')
  } catch (err) {
    log(`WARNING: failed to stop Kubo daemon: ${err.message}`)
  }

  // Clean up config file
  const backendJsonPath = path.join(__dirname, 'ipfs-backend.json')
  log(`Removing ${backendJsonPath}...`)
  fs.rmSync(backendJsonPath, { force: true })
  log('Config file removed')

  log('=== GLOBAL TEARDOWN COMPLETE ===')
}

export default globalTeardown

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import { stop } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const log = (msg) => process.stderr.write(`[${new Date().toISOString()}] [global-teardown] ${msg}\n`)

const globalTeardown = async (config) => {
  log('Starting global teardown...')

  // Stop the Kubo daemon properly
  try {
    await stop()
  } catch (err) {
    log(`Warning: failed to stop Kubo daemon: ${err.message}`)
  }

  // Clean up config file
  const backendJsonPath = path.join(__dirname, 'ipfs-backend.json')
  fs.rmSync(backendJsonPath, { force: true })

  log('Global teardown complete')
}

export default globalTeardown

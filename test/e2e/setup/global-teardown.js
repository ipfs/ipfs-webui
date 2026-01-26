import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import { stop } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const globalTeardown = async (config) => {
  console.log('[global-teardown] starting')

  // Stop the Kubo daemon properly
  try {
    await stop()
  } catch (err) {
    console.error(`[global-teardown] WARNING: failed to stop Kubo daemon: ${err.message}`)
  }

  // Clean up config file
  const backendJsonPath = path.join(__dirname, 'ipfs-backend.json')
  fs.rmSync(backendJsonPath, { force: true })

  console.log('[global-teardown] complete')
}

export default globalTeardown

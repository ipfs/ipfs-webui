import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import { stop } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const globalTeardown = async (config) => {
  try {
    await stop()
  } catch (err) {
    console.error(`[global-teardown] WARNING: ${err.message}`)
  }
  fs.rmSync(path.join(__dirname, 'ipfs-backend.json'), { force: true })
}

export default globalTeardown

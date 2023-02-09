import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const globalTeardown = async (config) => {
  fs.rmSync(path.join(__dirname, 'ipfs-backend.json'), { force: true })
}

export default globalTeardown

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const fixtureData = (filename, encoding = 'utf8') => {
  const filepath = join(__dirname, filename)
  return { path: filepath, data: readFileSync(filepath, encoding) }
}

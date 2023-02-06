import { readFileSync } from 'fs'
import { join } from 'path'

export const fixtureData = (filename, encoding = 'utf8') => {
  const filepath = join(__dirname, filename)
  return { path: filepath, data: readFileSync(filepath, encoding) }
}

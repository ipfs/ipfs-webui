import fs from 'fs'
import path from 'path'
const fixtureData = (filename, encoding = 'utf8') => {
  const filepath = path.join(__dirname, filename)
  return { path: filepath, data: fs.readFileSync(filepath, encoding) }
}
export { fixtureData }
export default {
  fixtureData
}

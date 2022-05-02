const fs = require('fs')
const path = require('path')

const fixtureData = (filename, encoding = 'utf8') => {
  const filepath = path.join(__dirname, filename)
  return { path: filepath, data: fs.readFileSync(filepath, encoding) }
}

module.exports = {
  fixtureData
}

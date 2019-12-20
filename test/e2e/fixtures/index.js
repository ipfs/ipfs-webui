const fs = require('fs')
const path = require('path')

const fixturePath = (filename) => {
  return path.join(__dirname, filename)
}

const fixtureData = (filename, encoding = 'utf8') => {
  return fs.readFileSync(fixturePath(filename), encoding)
}

module.exports = {
  fixturePath,
  fixtureData
}

const path = require('path')
const fs = require('fs')

module.exports = async config => {
  fs.rmSync(path.join(__dirname, 'ipfs-backend.json'), { force: true })
}

var createConfig = require('hjs-webpack')

var config = createConfig({
  in: './app/scripts/main.js',
  out: 'public',
  clearBeforeBuild: '!(locale|img|favicon.ico)'
})

// Handle js-ipfs-api
config.module.loaders.push({
  test: 'node_modules/ipfs-api/.*\.js',
  loader: 'babel-loader'
})

config.externals = {
  net: '{}',
  fs: '{}',
  tls: '{}',
  console: '{}',
  'require-dir': '{}'
}

module.exports = config

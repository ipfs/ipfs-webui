var createConfig = require('hjs-webpack')

var config = createConfig({
  in: './app/scripts/main.js',
  out: 'dist',
  clearBeforeBuild: '!(locale|img|favicon.ico)'
})

// Handle js-ipfs-api
config.module.loaders.push({
  test: /\.js$/,
  include: /node_modules\/(hoek|qs|wreck|boom|ipfs-api)/,
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

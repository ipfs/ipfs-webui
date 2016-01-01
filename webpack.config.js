var createConfig = require('hjs-webpack')

var config = createConfig({
  in: './app/scripts/app.js',
  out: 'dist',
  html: function (ctx) {
    return ctx.defaultTemplate({
      publicPath: ''
    })
  },
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

config.resolve = {
  modulesDirectories: [
    'node_modules'
  ],
  alias: {
    http: 'stream-http',
    https: 'https-browserify'
  }
}

module.exports = config

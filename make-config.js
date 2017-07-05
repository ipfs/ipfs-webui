const createConfig = require('hjs-webpack')

module.exports = (isDev) => {
  const config = createConfig({
    isDev: isDev,
    in: './src/app/js/index.js',
    out: './dist',
    output: {
      publicPath: ''
    },
    html: (ctx) => {
      return ctx.defaultTemplate({
        publicPath: ''
      })
    },
    clearBeforeBuild: '!(locale|img|favicon.ico)'
  })

  // Handle js-ipfs-api
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules\/(hoek|qs|wreck|boom|lodash-es|ipfs*|libp2p*|ipld*|multi*|promisify-es6|cid*|peer*|is-ipfs)/,
    loader: 'babel-loader'
  })

  config.externals = {
    // Needed for js-ipfs-api
    net: '{}',
    fs: '{}',
    tls: '{}',
    console: '{}',
    'require-dir': '{}',
    // Needed for enzyme
    jsdom: 'window',
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': 'window',
    'text-encoding': 'window'
  }

  config.resolve = {
    alias: {
      http: 'stream-http',
      https: 'https-browserify',
      sinon: 'sinon/pkg/sinon'
    }
  }

  config.module.noParse = config.module.noParse || []
  config.module.noParse.push(/node_modules\/sinon\//)

  return config
}

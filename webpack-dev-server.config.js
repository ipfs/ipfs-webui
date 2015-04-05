'use strict'
var webpack = require('webpack')
var _ = require('lodash')
var port = Number(process.env.PORT || 8010) + 1

// Extends base config with react-hot-loader and webpack-dev-server
var chars = 0
module.exports = _.extend({}, require('./webpack.config.js'), {
  entry: {
    bundle: [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/dev-server',
      './js/main.jsx'
    ]
  },
  devServer: {
    port: port,
    contentBase: '.',
    info: false, //  --no-info option
    hot: true,
    inline: true,
    colors: true
  },
  output: {
    path: '/',
    library: '[name]',
    filename: '[name].js'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    }),
    new webpack.ProgressPlugin(function (percentage, msg) {
      if (percentage < 1) {
        percentage = Math.floor(percentage * 100)
        msg = percentage + '% ' + msg
        if (percentage < 100) {
          msg = ' ' + msg
        }
        if (percentage < 10) {
          msg = ' ' + msg
        }
      }
      goToLineStart(msg)
      process.stderr.write(msg)

      function goToLineStart (nextMessage) {
        var str = ''
        for (; chars > nextMessage.length; chars--) {
          str += '\b \b'
        }
        chars = nextMessage.length
        for (var i = 0; i < chars; i++) {
          str += '\b'
        }
        if (str) process.stderr.write(str)
      }
    })
  ],
  debug: true,
  devtool: 'eval'
})

// Reuse the existing loaders config, but we need to add the hot loader for react
module.exports.module.loaders.unshift({test: /\.jsx$/, exclude: /node_modules/, loader: 'react-hot-loader'})

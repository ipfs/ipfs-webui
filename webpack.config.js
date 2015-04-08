'use strict'
var webpack = require('webpack')

// Production build
module.exports = {
  context: __dirname,
  entry: {
    bundle: './js/main.jsx'
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].min.js'
  },
  module: {
    noParse: [
      // Some extra speed
      require.resolve('three'),
      require.resolve('d3')
    ],
    loaders: [
      {test: /\.jsx?$/, exclude: /(node_modules|static\/js)/, loader: 'babel-loader?stage=0'},
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
      {test: /\.(png|jpg|jpeg|bmp|gif)$/, loader: 'url-loader?limit=10000'},
      // Fixes ipfs-api, which is reading its own package.json
      {test: /\/node_modules\/ipfs-api\/index\.js/, loader: 'transform-loader/cacheable?brfs'},
      // fonts
      // the url-loader uses DataUrls.
      // the file-loader emits files.
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },

      // Shims for browser modules
      { test: require.resolve('jquery'), loader: 'expose?jQuery' }, // expose to window for libs like bootstrap
      { test: require.resolve('./static/js/globe'), loader: 'exports?DAT.Globe!imports?THREE=three' }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()
    // Compress, but don't print warnings to console
    // , new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}})
  ],
  resolve: {
    alias: {
      'globe': require.resolve('./static/js/globe')
    },
    root: __dirname,
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
  }
}

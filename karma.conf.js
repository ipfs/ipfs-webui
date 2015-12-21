var webpackConfig = require('./webpack.config')

module.exports = function (config) {
  config.set({

    browsers: [ process.env.CONTINUOUS_INTEGRATION ? 'Firefox' : 'Chrome' ],

    singleRun: false,

    frameworks: [ 'mocha' ],

    files: [
      'tests.webpack.js'
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'dots' ],

    webpack: webpackConfig,

    webpackServer: {
      noInfo: true
    },

    autoWatch: true
  })
}

var webpackConfig = require('./webpack.config')

module.exports = function (config) {
  config.set({

    browsers: [ process.env.CONTINUOUS_INTEGRATION ? 'Firefox' : 'Chrome' ],

    singleRun: false,

    frameworks: [ 'mocha' ],

    files: [
      'test/setup.js'
    ],

    preprocessors: {
      'test/setup.js': ['webpack', 'sourcemap']
    },

    reporters: [ 'dots' ],

    webpack: webpackConfig,

    webpackServer: {
      noInfo: true
    },

    autoWatch: true
  })
}

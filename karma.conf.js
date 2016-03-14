var webpackConfig = require('./make-config')(true)

module.exports = function (config) {
  config.set({

    browsers: [process.env.CONTINUOUS_INTEGRATION ? 'Firefox' : 'Chrome'],

    singleRun: false,

    frameworks: ['mocha'],

    files: [
      'test/setup.js'
    ],

    preprocessors: {
      'test/setup.js': ['webpack', 'sourcemap']
    },

    reporters: ['mocha-own'],

    mochaOwnReporter: {
      reporter: 'spec'
    },

    webpack: webpackConfig,

    webpackServer: {
      noInfo: true
    },

    autoWatch: true
  })
}

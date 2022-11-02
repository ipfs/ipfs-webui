/**
 * upgrading to react-scripts v5 with any sort of decent sized app causes all kinds of errors
 *
 * @see https://github.com/facebook/create-react-app/issues/11756#issuecomment-1184657437
 * @see https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
 */
const webpack = require('webpack')

/**
 *
 * @param {import('webpack').RuleSetRule[]} rules
 */
function modifyBabelLoaderRule (rules, root = true) {
  const foundRules = []
  rules.forEach((rule, i) => {
    if (rule.loader != null) {
      if (rule.loader.includes('babel-loader')) {
        foundRules.push(rule)
      }
    } else if (rule.use?.loader != null) {
      if (typeof rule.use.loader !== 'string') {
        if (rule.use.loader.find(loader => loader.indexOf('babel-loader') >= 0)) {
          foundRules.push(rule)
        }
      } else if (rule.use.loader.indexOf('babel-loader') >= 0) {
        foundRules.push(rule)
      }
    } else if (rule.oneOf) {
      const nestedRules = modifyBabelLoaderRule(rule.oneOf, false)
      foundRules.push(...nestedRules)
    }
  })

  if (root) {
    foundRules.forEach((rule, index) => {
      if (rule.include?.indexOf('src') >= 0) {
        console.log('Found CRA babel-loader rule for source files. Modifying it to instrument for code coverage.')
        console.log('rule: ', rule)
        rule.options.plugins.push('istanbul')
      }
    })
  }

  return foundRules
}

function webpackOverride (config) {
  const fallback = config.resolve.fallback || {}

  Object.assign(fallback, {
    assert: require.resolve('./src/webpack-fallbacks/assert'),
    stream: require.resolve('./src/webpack-fallbacks/stream'),
    os: require.resolve('./src/webpack-fallbacks/os'),
    path: require.resolve('./src/webpack-fallbacks/path')
  })

  config.resolve.fallback = fallback

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ])

  // Instrument for code coverage in development mode
  const REACT_APP_ENV = process.env.REACT_APP_ENV ?? process.env.NODE_ENV ?? 'production'
  if (REACT_APP_ENV === 'test') {
    modifyBabelLoaderRule(config.module.rules)
  }

  return config
}

module.exports = {
  webpack: webpackOverride,
  jest: (config) => config
}

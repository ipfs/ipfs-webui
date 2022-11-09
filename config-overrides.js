/**
 * upgrading to react-scripts v5 with any sort of decent sized app causes all kinds of errors
 *
 * @see https://github.com/facebook/create-react-app/issues/11756#issuecomment-1184657437
 * @see https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
 */
const webpack = require('webpack')
const PURE_ESM_MODULES = [
  'ipfs-geoip'
]

/**
 * Returns true if the rule matches the given loader
 *
 * @param {import('webpack').RuleSetRule} rule
 * @param {string} testString
 * @returns
 */
function ruleTester (rule, testString) {
  if (rule.loader != null) {
    if (rule.loader.includes(testString)) {
      return true
    }
  } else if (rule.use?.loader != null) {
    if (typeof rule.use.loader !== 'string') {
      if (rule.use.loader.find(loader => loader.indexOf(testString) >= 0)) {
        return true
      }
    } else if (rule.use.loader.indexOf(testString) >= 0) {
      return true
    }
  }
  return false
}

/**
 * Adds exclude rules for pure ESM Modules
 *
 * @param {import('webpack').RuleSetRule[]} rules
 */
function modifyBabelLoaderRuleForBuild (rules) {
  return rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = modifyBabelLoaderRuleForBuild(rule.oneOf)
    } else if (ruleTester(rule, 'babel-loader')) {
      if ('exclude' in rule) {
        if (!Array.isArray(rule.exclude)) {
          rule.exclude = [rule.exclude]
        }
      } else {
        rule.exclude = []
      }
      PURE_ESM_MODULES.forEach(module => {
        rule.exclude.push(new RegExp(`node_modules/${module}`))
      })
    }
    return rule
  })
}

/**
 *
 * @param {import('webpack').RuleSetRule[]} rules
 */
function modifyBabelLoaderRuleForTest (rules) {
  return rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = modifyBabelLoaderRuleForTest(rule.oneOf)
    } else if (rule.use) {
      rule.use = modifyBabelLoaderRuleForTest(rule.use)
    } else if (rule.options && rule.options.plugins) {
      rule.options.plugins.push('istanbul')
    }
    return rule
  })
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

  config.module.rules = modifyBabelLoaderRuleForBuild(config.module.rules)

  // Instrument for code coverage in development mode
  const REACT_APP_ENV = process.env.REACT_APP_ENV ?? process.env.NODE_ENV ?? 'production'
  if (REACT_APP_ENV === 'test') {
    config.module.rules = modifyBabelLoaderRuleForTest(config.module.rules)
  }

  return config
}

module.exports = {
  webpack: webpackOverride,
  jest: (config) => config
}

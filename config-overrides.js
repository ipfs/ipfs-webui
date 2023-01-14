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
 * This function goes through the loader rules and applies modifier function to the said rule.
 * Validation can be set within the modifier function.
 *
 * @param {import('webpack').RuleSetRule[]} rules
 * @param {function} modifier defaults to identity function
 * @returns {import('webpack').RuleSetRule[]}
 */
function modifyBabelLoaderRules (rules, modifier = r => r) {
  return rules.map(rule => {
    if (rule.oneOf) {
      rule.oneOf = modifyBabelLoaderRules(rule.oneOf, modifier)
    } else if (rule.use) {
      rule.use = modifyBabelLoaderRules(rule.use, modifier)
    } else {
      rule = modifier(rule)
    }
    return rule
  })
}

/**
 * Adds exclude rules for pure ESM Modules.
 *
 * @param {import('webpack').RuleSetRule[]} rules
 * @returns {import('webpack').RuleSetRule[]}
 */
function modifyBabelLoaderRuleForBuild (rules) {
  return modifyBabelLoaderRules(rules, rule => {
    if (rule.loader && rule.loader.includes('babel-loader')) {
      if ('exclude' in rule) {
        if (!Array.isArray(rule.exclude)) {
          rule.exclude = [rule.exclude]
        }
        PURE_ESM_MODULES.forEach(module => {
          rule.exclude.push(new RegExp(`node_modules/${module}`))
        })
      }
    }
    return rule
  })
}

/**
 * Adds instrumentation plugin for code coverage in test mode.
 *
 * @param {import('webpack').RuleSetRule[]} rules
 * @returns {import('webpack').RuleSetRule[]}
 */
function modifyBabelLoaderRuleForTest (rules) {
  return modifyBabelLoaderRules(rules, rule => {
    if (rule.options && rule.options.plugins) {
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
  jest: (config) => {
    console.log('config.roots: ', config.roots)
    console.log('config.modulePaths: ', config.modulePaths)
    console.log('config.moduleDirectories: ', config.moduleDirectories)
    console.log('config.transform: ', config.transform)
    console.log('config.transformIgnorePatterns: ', config.transformIgnorePatterns)
    return ({
      ...config,
      modulePaths: [
        ...config.modulePaths,
        'node_modules',
        '<rootDir>',
        '<rootDir>/node_modules'
      ],
      transform: {
        // '^.*(?:kubo-rpc-client|ipfsd-ctl).*$': '<rootDir>/jest-esm-transformer.js',
        '^.+/node_modules/kubo-rpc-client.+$': '<rootDir>/jest-esm-transformer.js',
        // '^.+/node_modules/@libp2p\\/logger.+$': '<rootDir>/jest-esm-transformer.js',
        // '^.+/node_modules/nanoid.+$': '<rootDir>/jest-esm-transformer.js',
        // '^.+/node_modules/temp-write.+$': '<rootDir>/jest-esm-transformer.js',
        // '^.+/node_modules/ipfsd-ctl.+$': '<rootDir>/jest-esm-transformer.js',
        // '.+ipfsd-ctl.+': '<rootDir>/jest-esm-transformer.js',
        // '^.*kubo-rpc-client.*$': 'babel-jest',
        ...config.transform
        // 'node_modules/kubo-rpc-client/.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest'
        // 'kubo-rpc-client': 'jest-esm-transformer'
      },
      transformIgnorePatterns: [
        '<rootDir>[/\\\\]node_modules[/\\\\](?!kubo-rpc-client|ipfsd-ctl|ipfsd-ctl\\/node_modules\\/|@libp2p\\/logger|nanoid|temp-write|@multiformats/multiaddr|is-ip|ip-regex|execa|strip-final-newline|npm-run-path|path-key|onetime|mimic-fn|human-signals|is-stream|p-wait-for).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$'
      ],
      moduleNameMapper: {
        'ipfsd-ctl': '<rootDir>/node_modules/ipfsd-ctl/dist/src/index.js',
        '@libp2p/logger': '<rootDir>/node_modules/@libp2p/logger/dist/src/index.js',
        nanoid: '<rootDir>/node_modules/@libp2p/logger/dist/src/index.js',
        '@multiformats/multiaddr': '<rootDir>/node_modules/@multiformats/multiaddr/dist/src/index.js'
      }
    })
  }
}

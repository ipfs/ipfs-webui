/**
 * upgrading to react-scripts v5 with any sort of decent sized app causes all kinds of errors
 *
 * @see https://github.com/facebook/create-react-app/issues/11756#issuecomment-1184657437
 * @see https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
 */
import webpack from 'webpack'

const PURE_ESM_MODULES = [
  'ipfs-geoip',
  // 'ipld-explorer-components',
  '@chainsafe/is-ip',
  '@multiformats/multiaddr',
  '@libp2p/interface',
  'dag-jose',
  'uint8arrays'
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
    stream: 'stream-browserify',
    os: 'os-browserify/browser',
    path: 'path-browserify',
    crypto: 'crypto-browserify'
  })

  config.resolve.fallback = fallback

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ])

  config.module.rules = modifyBabelLoaderRuleForBuild(config.module.rules)
  config.module.rules.push({
    test: /\.jsx?$/,
    exclude: /(node_modules|bower_components)/,
    loader: 'babel-loader',
    options: { presets: ['@babel/env', '@babel/preset-react'] }
  })

  config.module.rules.push({
    test: /\.m?js$/,
    type: 'javascript/auto',
    resolve: {
      fullySpecified: false
    }
  })

  // Instrument for code coverage in development mode
  const REACT_APP_ENV = process.env.REACT_APP_ENV ?? process.env.NODE_ENV ?? 'development'
  if (REACT_APP_ENV === 'test') {
    config.module.rules = modifyBabelLoaderRuleForTest(config.module.rules)
    config.devtool = 'inline-source-map'
  } else if (REACT_APP_ENV === 'development') {
    config.optimization = {
      ...config.optimization,
      minimize: false,
      mangleExports: false,
      innerGraph: false,
      moduleIds: 'named'
    }
    config.devtool = 'source-map'
  }

  return config
}

const configOverride = {
  webpack: webpackOverride,
  jest: (config) => {
    /**
     * @type {import('jest').Config}
     */
    return ({
      ...config,
      setupFiles: [...config.setupFiles, 'fake-indexeddb/auto'],
      moduleNameMapper: {
        ...config.moduleNameMapper,
        'multiformats/basics': '<rootDir>/node_modules/multiformats/src/basics.js',
        '@libp2p/interface/errors': '<rootDir>/node_modules/@libp2p/interface/dist/src/errors.js',
        'multiformats/bases/base32': '<rootDir>/node_modules/multiformats/src/bases/base32.js',
        'multiformats/bases/base58': '<rootDir>/node_modules/multiformats/src/bases/base58.js',
        'multiformats/cid': '<rootDir>/node_modules/multiformats/src/cid.js',
        'multiformats/hashes/digest': '<rootDir>/node_modules/multiformats/src/hashes/digest.js',
        'uint8arrays/alloc': '<rootDir>/node_modules/uint8arrays/dist/src/alloc.js',
        'uint8arrays/concat': '<rootDir>/node_modules/uint8arrays/dist/src/concat.js',
        'uint8arrays/equals': '<rootDir>/node_modules/uint8arrays/dist/src/equals.js',
        'uint8arrays/from-string': '<rootDir>/node_modules/uint8arrays/dist/src/from-string.js',
        'uint8arrays/to-string': '<rootDir>/node_modules/uint8arrays/dist/src/to-string.js',
        '@chainsafe/is-ip/parse': '<rootDir>/node_modules/@chainsafe/is-ip/lib/parse.js',
        // eslint-disable-next-line quote-props
        'eventemitter3': '<rootDir>/node_modules/eventemitter3/dist/eventemitter3.esm.js'
      },
      transformIgnorePatterns: [
        'node_module/(?!(eventemitter3)/).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$' // default
      ]
    })
  }
}

export default configOverride

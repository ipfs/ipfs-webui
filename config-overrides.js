/**
 * upgrading to react-scripts v5 with any sort of decent sized app causes all kinds of errors
 *
 * @see https://github.com/facebook/create-react-app/issues/11756#issuecomment-1184657437
 * @see https://alchemy.com/blog/how-to-polyfill-node-core-modules-in-webpack-5
 */
const webpack = require('webpack');

module.exports = function override(config) {

  const fallback = config.resolve.fallback || {};

  Object.assign(fallback, {
    "assert": require.resolve('./src/webpack-fallbacks/assert'),
    "stream": require.resolve('./src/webpack-fallbacks/stream'),
    "os": require.resolve('./src/webpack-fallbacks/os'),
    "path": require.resolve('./src/webpack-fallbacks/path'),
  })

  config.resolve.fallback = fallback;

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ])

  return config;
}

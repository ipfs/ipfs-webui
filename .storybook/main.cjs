/* eslint-disable import/esm-extensions */
/**
 * @file StoryBook configuration file
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#from-version-52x-to-53x
 */

const webpack = require('webpack')

/** @type {import('@storybook/core-common').StorybookConfig} */
const storybookConfig = {
  core: {
    builder: 'webpack5'
  },
  reactOptions: {
    legacyRootApi: false
  },
  stories: [
    '../src/**/*.stories.@(ts|js|tsx|jsx)'
  ],
  framework: '@storybook/react',
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    // '@storybook/addon-knobs',
    '@storybook/addon-controls',
    // '@storybook/addon-postcss',
    '@storybook/preset-create-react-app',
    '@storybook/addon-coverage'
  ],
  staticDirs: [
    '../public'
  ],
  features: {
    postcss: false,
    storyStoreV7: true,
    babelModeV7: true
  },
  webpackFinal: async (config) => {
    const { webpack: webpackOverride } = (await import('../config-overrides.js')).default

    config.module.rules.push({
      test: /\.(m?js)$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    })
    return webpackOverride({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias
        },
        extensions: [
          ...config.resolve.extensions,
          'dist/esm/index.js'
        ]
      },
      // @see https://github.com/storybookjs/storybook/issues/18276#issuecomment-1137101774
      plugins: config.plugins.map(plugin => {
        if (plugin.constructor.name === 'IgnorePlugin') {
          return new webpack.IgnorePlugin({
            resourceRegExp: plugin.options.resourceRegExp,
            contextRegExp: plugin.options.contextRegExp
          })
        }

        return plugin
      })
    })
  }
}

module.exports = storybookConfig

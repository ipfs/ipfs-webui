/**
 * @file StoryBook configuration file
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#from-version-52x-to-53x
 */

const webpack = require('webpack')

const { webpack: webpackOverride } = require('../config-overrides')

/** @type {import('@storybook/core-common').StorybookConfig} */
const storybookConfig = {
  core: {
    builder: 'webpack5'
  },
  reactOptions: {
    legacyRootApi: true
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
    storyStoreV7: true
  },
  /**
   * @see https://storybook.js.org/docs/react/configure/typescript
   */
  typescript: {
    check: true,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config) => {
    return webpackOverride({
      ...config,
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

/* eslint-disable import/esm-extensions */
/**
 * @file StoryBook configuration file
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#from-version-52x-to-53x
 */

const webpack = require('webpack')
const path = require('path')

/**
 * Storybook Workaround: https://github.com/storybookjs/storybook/issues/14877#issuecomment-1000441696
 */
const replaceFileExtension = (filePath, newExtension) => {
  const { name, root, dir } = path.parse(filePath)
  return path.format({
    name,
    root,
    dir,
    ext: newExtension
  })
}

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
    storyStoreV7: false
  },
  webpackFinal: async (config) => {
    // console.log('config: ', config)
    const { webpack: webpackOverride } = (await import('../config-overrides.js')).default
    // return {
    //   ...config,
    //   alias: {
    //     ...config.alias,
    //     '@storybook/react': 'node_modules/@storybook/react/dist/esm/client/preview/config.js'
    //   },
    //   plugins: config.plugins.map(plugin => {
    //     if (plugin.constructor.name === 'IgnorePlugin') {
    //       return new webpack.IgnorePlugin({
    //         resourceRegExp: plugin.options.resourceRegExp,
    //         contextRegExp: plugin.options.contextRegExp
    //       })
    //     }

    //     return plugin
    //   })
    // }
    // Find the plugin instance that needs to be mutated
    const virtualModulesPlugin = config.plugins.find(
      (plugin) => plugin.constructor.name === 'VirtualModulesPlugin'
    )

    // Change the file extension to .cjs for all files that end with "generated-stories-entry.js"
    virtualModulesPlugin._staticModules = Object.fromEntries(
      Object.entries(virtualModulesPlugin._staticModules).map(
        ([key, value]) => {
          if (key.endsWith('generated-stories-entry.js')) {
            return [replaceFileExtension(key, '.cjs'), value]
          }
          return [key, value]
        }
      )
    )

    // Change the entry points to point to the appropriate .cjs files
    config.entry = config.entry.map((entry) => {
      if (entry.endsWith('generated-stories-entry.js')) {
        return replaceFileExtension(entry, '.cjs')
      }
      return entry
    })

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

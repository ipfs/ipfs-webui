/**
 * @file StoryBook configuration file
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#from-version-52x-to-53x
 */

const webpack = require('webpack');

module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: ['../src/**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-knobs',
    '@storybook/addon-postcss',
    '@storybook/preset-create-react-app',
  ],
  staticDirs: [
    '../public'
  ],
  webpackFinal: async (config) => ({
    ...config,
    // @see https://github.com/storybookjs/storybook/issues/18276#issuecomment-1137101774
    plugins: config.plugins.map(plugin => {
      if (plugin.constructor.name === 'IgnorePlugin') {
        return new webpack.IgnorePlugin({
            resourceRegExp: plugin.options.resourceRegExp,
            contextRegExp: plugin.options.contextRegExp
        });
      }

      return plugin;
    }),
}),
};

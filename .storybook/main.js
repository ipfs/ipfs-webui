/**
 * @see https://github.com/storybookjs/storybook/blob/master/MIGRATION.md#from-version-52x-to-53x
 */

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
};

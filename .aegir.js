
/** @type {import('aegir').PartialOptions} */
export default {
  dependencyCheck: {
    ignore: [
      // actual production deps not getting recognized
      '@loadable/component',
      '@tableflip/react-dropdown',
      'brace',
      'chart.js',
      'classnames',
      'details-polyfill',
      'internal-nav-helper',
      'ipfs-css',
      'ipld-explorer-components',
      'is-ipfs',
      'istextorbinary',
      'prop-types',
      'react-ace',
      'react-chartjs-2',
      'react-copy-to-clipboard',
      'react-country-flag',
      'react-debounce-render',
      'react-dnd',
      'react-helmet',
      'react-hook-form',
      'react-i18next',
      'react-identicons',
      'react-joyride',
      'react-overlays',
      'react-qr-code',
      'react-virtualized',
      'redux-bundler-react',
      'tachyons',
      'uint8arrays',

      // babel-preset-react-app uses this without declaring it as a dependency
      // see: https://github.com/facebook/create-react-app/issues/13325
      '@babel/plugin-proposal-private-property-in-object',

      // type-only deps
      'ipfs',

      // webpack deps
      'crypto-browserify',
      'os-browserify',
      'path-browserify',
      'stream-browserify',
      'fake-indexeddb',

      // test deps
      'enzyme',
      'enzyme-adapter-react-16',
      'jest',
      'jest-environment-jsdom', // in npm script via --env=jsdom
      '@testing-library/react', // jsx is not tested properly
      '@testing-library/jest-dom', // jsx is not tested properly


      // storybook deps
      '@storybook/addons', // for types
      '@storybook/addon-a11y',
      '@storybook/addon-actions',
      '@storybook/addon-controls',
      '@storybook/addon-coverage',
      '@storybook/addon-essentials',
      '@storybook/addon-links',
      '@storybook/builder-webpack5', // storybookConfig.core.builder
      '@storybook/core-common', // types
      '@storybook/manager-webpack5', // implicit storybook dep
      '@storybook/preset-create-react-app',

      // npm scripts
      'wait-on',

      // github CI
      'nyc',
      'semantic-release'
    ],

    developmentIgnorePatterns: [
      'src/**/*.js',
      'src/**/*.jsx',
      'src/**/*.ts',
      'src/**/*.tsx',
      'test/**/*',
      '!.aegir.js',
      '!.eslintrc.cjs',
      '!config-overrides.js',
      '!custom-release-notes-generator.cjs',
      '!postcss.config.js',
      '!**/*.test.js',
      '!**/*.stories.js',
      '!test/**',
      '!src/setupTests.js',
      '!src/**/*.test.ts',
      '!src/**/*.test.tsx',
      '!src/**/*.test.jsx',
      '!src/**/*.test.js'
    ],

    productionIgnorePatterns: [
      '.aegir.js',
      '.eslintrc.cjs',
      'config-overrides.js',
      'custom-release-notes-generator.cjs',
      'postcss.config.js',
      '**/*.test.js',
      '**/*.stories.js',
      'test/**',
      'src/setupTests.js',
      'src/**/*.test.ts',
      'src/**/*.test.tsx'
    ]
  }
}

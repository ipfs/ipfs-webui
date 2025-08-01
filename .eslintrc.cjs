module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  extends: ['react-app', 'standard', 'plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y', 'storybook', 'import'],
  rules: {
    'react/prop-types': [0, { ignore: ['className'], customValidators: [], skipUndeclared: true }], // TODO: set this rule to error when all issues are resolved.
    'no-void': 'off'
  },
  overrides: [
    {
      files: ['src/**/*.stories.js'],
      excludedFiles: '*.test.js',
      rules: {
        'import/no-anonymous-default-export': 'off'
      }
    }
  ]
}

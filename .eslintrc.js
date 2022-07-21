module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  extends: ['react-app', 'standard', 'plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y', 'storybook'],
  // ignore .ts files because it fails to parse it.
  ignorePatterns: 'src/**/*.ts'
}

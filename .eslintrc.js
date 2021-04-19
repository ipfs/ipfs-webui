module.exports = {
  parser: 'babel-eslint',
  extends: ['react-app', 'standard', 'plugin:jsx-a11y/recommended'],
  plugins: ['jsx-a11y'],
  // ignore .ts files because it fails to parse it.
  ignorePatterns: 'src/**/*.ts'
}

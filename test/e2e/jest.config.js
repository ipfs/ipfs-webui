module.exports = {
  preset: 'jest-puppeteer',
  testRegex: './*\\.test\\.js$',
  testEnvironment: './setup/test-environment.js',
  globalSetup: './setup/global-init.js',
  globalTeardown: './setup/global-teardown.js'
}

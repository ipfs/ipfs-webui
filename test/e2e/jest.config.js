
process.env.JEST_PLAYWRIGHT_CONFIG = './jest-playwright.config.js'

module.exports = {
  preset: 'jest-playwright-preset',
  testRegex: './*\\.test\\.js$',
  testEnvironment: './setup/test-environment.js',
  testTimeout: 30 * 1000,
  globalSetup: './setup/global-init.js',
  setupFilesAfterEnv: ['./setup/global-after-env.js'],
  globalTeardown: './setup/global-teardown.js'
}

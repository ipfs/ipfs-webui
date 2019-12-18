const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer')
const { teardown: teardownDevServer } = require('jest-dev-server')

module.exports = async function globalTeardown(globalConfig) {
  const teardown = []
  // custom teardown
  const ipfsd = global.__IPFSD__
  if (ipfsd) teardown.push(ipfsd.stop())
  // continue with global teardown
  teardown.push(teardownDevServer())
  teardown.push(teardownPuppeteer(globalConfig))
  await Promise.all(teardown)
}

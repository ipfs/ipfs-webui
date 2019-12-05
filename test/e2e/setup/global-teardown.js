const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer')
const { teardown: teardownDevServer } = require('jest-dev-server')

module.exports = async function globalTeardown(globalConfig) {
  // custom teardown
  const ipfsd = global.__IPFSD__
  if (ipfsd) {
    await ipfsd.stop(1000)
    if (process.env.DEBUG === 'true') {
      console.log('global-teardown.js: stopped ipfs daemon')
    }
  }
  // continue with global teardown
  await teardownDevServer()
  await teardownPuppeteer(globalConfig)
}

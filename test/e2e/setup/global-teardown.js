const { teardown: teardownDevServer } = require('jest-process-manager')

module.exports = async function globalTeardown (globalConfig) {
  const teardown = []
  // custom teardown
  const ipfsd = global.__IPFSD__
  if (ipfsd) teardown.push(ipfsd.stop())
  // continue with global teardown
  teardown.push(teardownDevServer())
  // teardown.push(teardownPlaywright(globalConfig))
  await Promise.all(teardown)
}

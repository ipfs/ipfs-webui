const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const { setup: setupDevServer } = require('jest-dev-server')
const Ctl = require('ipfsd-ctl')

module.exports = async function globalSetup(globalConfig) {
  // global setup first
  await setupPuppeteer(globalConfig)
  // http server with webui build
  await setupDevServer({
    command: 'ecstatic build --cache=0 --port=3001',
    launchTimeout: 10000,
    port: 3001,
    debug: process.env.DEBUG === 'true'
  })
  // ipfs daemon to expose http api used for e2e tests
  const factory = Ctl.createFactory({
    type: process.env.E2E_IPFSD_TYPE || 'go',
    test: true, // sets up all CORS headers required for accessing HTTP API port of ipfsd node
    disposable: true
  })
  ipfsd = await factory.spawn()
  if (process.env.DEBUG === 'true') {
    const { id, agentVersion } = await ipfsd.api.id()
    console.log(`global-init.js: spawned ${agentVersion} with Peer ID ${id}`)
  }
  global.__IPFSD__ = ipfsd // for later use
}

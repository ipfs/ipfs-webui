const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const { setup: setupDevServer } = require('jest-dev-server')
const Ctl = require('ipfsd-ctl')
const { findBin } = require('ipfsd-ctl/src/utils')

module.exports = async function globalSetup (globalConfig) {
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
  const type = findType()
  const endpoint = undefined // TODO: process.env.E2E_API_URL
  const factory = Ctl.createFactory({
    type,
    endpoint,
    remote: !!endpoint,
    test: true, // sets up all CORS headers required for accessing HTTP API port of ipfsd node
    overrides: { // call findBin here to ensure we use version from devDependencies, and not from ipfsd-ctl
      js: { ipfsBin: findBin('js') },
      go: { ipfsBin: findBin('go') }
    }
  })
  const ipfsd = await factory.spawn()
  if (process.env.DEBUG === 'true') {
    const { id, agentVersion } = await ipfsd.api.id()
    console.log(`global-init.js: using ${agentVersion} with Peer ID ${id} ${endpoint ? ' at ' + endpoint : ''}`)
  }
  global.__IPFSD__ = ipfsd // for later use
}

function findType () {
  // TODO if (process.env.E2E_API_URL) return
  return process.env.E2E_IPFSD_TYPE || 'go'
}

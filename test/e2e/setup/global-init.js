const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const { setup: setupDevServer } = require('jest-dev-server')
const getPort = require('get-port')
const ipfsClient = require('ipfs-http-client')
const Ctl = require('ipfsd-ctl')
const path = require('path')

// port on which static HTTP server exposes the webui from build/ directory
// for use in E2E tests

module.exports = async function globalSetup (globalConfig) {
  const webuiPort = await getPort()
  // global setup first
  await setupPuppeteer(globalConfig)
  // http server with webui build
  await setupDevServer({
    command: `http-server ./build/ -c-1 -a 127.0.0.1 -p ${webuiPort}`,
    launchTimeout: 10000,
    port: webuiPort,
    debug: process.env.DEBUG === 'true'
  })
  const endpoint = process.env.E2E_API_URL
  let ipfsd
  let ipfs
  if (endpoint) {
    // create http client for endpoint passed via E2E_API_URL=
    ipfs = ipfsClient({ apiAddr: endpoint })
  } else {
    // use ipfds-ctl to spawn daemon to expose http api used for e2e tests
    const type = process.env.E2E_IPFSD_TYPE || 'go'
    const factory = Ctl.createFactory({
      ipfsHttpModule: ipfsClient,
      ipfsModule: require('ipfs'),
      type,
      // sets up all CORS headers required for accessing HTTP API port of ipfsd node
      test: true
    },
    {
      go: {
        ipfsBin: require('go-ipfs').path()
      },
      js: {
        ipfsBin: path.resolve(__dirname, '../../../node_modules/ipfs/src/cli.js')
      }
    })

    ipfsd = await factory.spawn({ type })
    ipfs = ipfsd.api
  }
  const { id, agentVersion } = await ipfs.id()
  // store globals for later use
  global.__IPFSD__ = ipfsd
  global.__IPFS__ = ipfs
  global.__WEBUI_URL__ = `http://localhost:${webuiPort}/`
  // print basic diagnostics
  console.log(`\nE2E using ${agentVersion} (${endpoint || ipfsd.exec}) with Peer ID ${id}\n`)
}

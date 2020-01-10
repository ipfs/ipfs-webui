const { setup: setupPuppeteer } = require('jest-environment-puppeteer')
const { setup: setupDevServer } = require('jest-dev-server')
const getPort = require('get-port')
const ipfsClient = require('ipfs-http-client')
const { createController } = require('ipfsd-ctl')

// inlined findBin to ensure we use a binary relative to the root project
// and not a dependency of ipfsd-ctl itself. This enables us to specify custom
// versions of go-ipfs and js-ipfs in package.json of ipfs-webui
const os = require('os')
const isWindows = os.platform() === 'win32'
const findBin = (type) => {
  if (type === 'js') {
    return process.env.IPFS_JS_EXEC || require.resolve('ipfs/src/cli/bin.js')
  }
  return process.env.IPFS_GO_EXEC || require.resolve(`go-ipfs-dep/go-ipfs/${isWindows ? 'ipfs.exe' : 'ipfs'}`)
}

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
  let bin
  if (endpoint) {
    // create http client for endpoint passed via E2E_API_URL=
    ipfs = ipfsClient({ apiAddr: endpoint })
  } else {
    // use ipfds-ctl to spawn daemon to expose http api used for e2e tests
    const type = process.env.E2E_IPFSD_TYPE || 'go'
    ipfsd = await createController({
      type,
      test: true // sets up all CORS headers required for accessing HTTP API port of ipfsd node
    }, {
      // overrides: call findBin here to ensure we use version from devDependencies, and not from ipfsd-ctl
      js: { ipfsBin: findBin('js') },
      go: { ipfsBin: findBin('go') }
    })
    ipfs = ipfsd.api
    bin = findBin(type)
  }
  const { id, agentVersion } = await ipfs.id()
  // store globals for later use
  global.__IPFSD__ = ipfsd
  global.__IPFS__ = ipfs
  global.__WEBUI_URL__ = `http://localhost:${webuiPort}/`
  // print basic diagnostics
  console.log(`\nE2E using ${agentVersion} (${endpoint || bin}) with Peer ID ${id}\n`)
}

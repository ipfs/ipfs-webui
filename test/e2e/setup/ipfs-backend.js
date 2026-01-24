// @ts-check
import { create } from 'kubo-rpc-client'
import { createFactory } from 'ipfsd-ctl'
import windowOrGlobal from 'window-or-global'
import { path as kuboPath } from 'kubo'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import getPort from 'aegir/get-port'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { console } = windowOrGlobal

const log = (msg) => process.stderr.write(`[${new Date().toISOString()}] [ipfs-backend] ${msg}\n`)

// timeout wrapper for async operations that might hang
const withTimeout = (promise, ms, name) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout])
}

let ipfsd
let ipfs
async function run (rpcPort) {
  log('Starting ipfs-backend setup...')
  let gatewayPort = 8080
  if (ipfsd != null && ipfs != null) {
    throw new Error('IPFS backend already running')
  }
  const endpoint = process.env.E2E_API_URL
  if (endpoint) {
    // create http rpc client for endpoint passed via E2E_API_URL=
    ipfs = create(endpoint)
  } else {
    // use ipfds-ctl to spawn daemon to expose http api used for e2e tests
    gatewayPort = await getPort(gatewayPort, '0.0.0.0')
    const factory = createFactory({
      rpc: create,
      type: 'kubo',
      bin: process.env.IPFS_GO_EXEC || kuboPath(),
      init: {
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${rpcPort}`,
            Gateway: `/ip4/127.0.0.1/tcp/${gatewayPort}`
          },
          Bootstrap: [], // disable bootstrapping for faster startup in tests
          Gateway: {
            NoFetch: true,
            ExposeRoutingAPI: true
          },
          Routing: {
            Type: 'none'
          }
        }
      },
      // sets up all CORS headers required for accessing HTTP API port of ipfsd node
      test: true
    })

    log('Spawning kubo daemon...')
    ipfsd = await withTimeout(factory.spawn({ type: 'kubo' }), 30000, 'kubo daemon spawn')
    log('Kubo daemon spawned')
    ipfs = ipfsd.api
  }
  log('Getting node identity...')
  const { id, agentVersion } = await ipfs.id()
  log(`Node ready: ${id}`)

  // some temporary hardcoding until https://github.com/ipfs/js-ipfsd-ctl/issues/831 is resolved.
  const { apiHost, apiPort, gatewayHost } = { apiHost: '127.0.0.1', apiPort: rpcPort, gatewayHost: '127.0.0.1' }

  if (Number(apiPort) !== Number(rpcPort)) {
    console.error(`Invalid RPC port returned by IPFS backend: ${apiPort} != ${rpcPort}`)
    await ipfsd.stop()
    process.exit(1)
  }

  const rpcAddr = `/ip4/${apiHost}/tcp/${apiPort}`
  const gatewayAddr = `http://${gatewayHost}:${gatewayPort}`

  // persist details for e2e tests
  fs.writeFileSync(path.join(__dirname, 'ipfs-backend.json'), JSON.stringify({
    rpcAddr,
    id,
    agentVersion,
    /**
     * Used by ipfs-webui to connect to Kubo via the kubo-rpc-client
     */
    apiOpts: {
      host: apiHost,
      port: apiPort,
      protocol: 'http'
    },
    /**
     * Used by ipld-explorer-components to connect to the kubo gateway
     */
    kuboGateway: {
      host: gatewayHost,
      port: gatewayPort,
      protocol: 'http'
    }
  }))

  console.log(`\nE2E using ${agentVersion} (${endpoint || ipfsd.exec})
  Peer ID: ${id}
  rpcAddr: ${rpcAddr}
  gatewayAddr: ${gatewayAddr}`)

  if (endpoint) {
    // When using E2E_API_URL, just return after creating the JSON file
    console.log('Connected to existing node, returning...')
    return
  }

  // Only keep running and handle SIGINT when spawning a new node
  const teardown = async () => {
    console.log(`Stopping IPFS backend ${id}`)
    await ipfsd.stop()
    process.exit(1)
  }
  process.stdin.resume()
  process.on('SIGINT', teardown)
}

async function stop () {
  if (ipfsd) {
    log('Stopping Kubo daemon...')
    await ipfsd.stop()
    log('Kubo daemon stopped')
    ipfsd = null
    ipfs = null
  }
}

export { run, stop }

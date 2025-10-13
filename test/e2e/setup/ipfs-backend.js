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

let ipfsd
let ipfs
async function run (rpcPort) {
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

    ipfsd = await factory.spawn({ type: 'kubo' })
    ipfs = ipfsd.api
  }
  const { id, agentVersion } = await ipfs.id()

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

export { run }

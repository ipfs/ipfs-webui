import * as kuboRpcModule from 'kubo-rpc-client'
import * as Ctl from 'ipfsd-ctl'
import windowOrGlobal from 'window-or-global'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { console } = windowOrGlobal

let ipfsd
let ipfs
async function run (rpcPort) {
  if (ipfsd != null && ipfs != null) {
    throw new Error('IPFS backend already running')
  }
  const endpoint = process.env.E2E_API_URL
  if (endpoint) {
    // create http rpc client for endpoint passed via E2E_API_URL=
    ipfs = kuboRpcModule.create(endpoint)
  } else {
    // use ipfds-ctl to spawn daemon to expose http api used for e2e tests
    const type = 'go'
    const factory = Ctl.createFactory({
      kuboRpcModule,
      type,
      ipfsOptions: {
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${rpcPort}`
          }
        }
      },
      // sets up all CORS headers required for accessing HTTP API port of ipfsd node
      test: true
    },
    {
      go: {
        ipfsBin: process.env.IPFS_GO_EXEC || (await import('kubo')).default.path()
      }
    })

    ipfsd = await factory.spawn({ type })
    ipfs = ipfsd.api
  }
  const { id, agentVersion } = await ipfs.id()

  const { apiHost, apiPort, gatewayHost, gatewayPort } = ipfs

  if (String(apiPort) !== rpcPort) {
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

  const teardown = async () => {
    console.log(`Stopping IPFS backend ${id}`)
    await ipfsd.stop()
    process.exit(1)
  }
  process.stdin.resume()
  process.on('SIGINT', teardown)
}

run(process.argv[2])

// import * as kuboRpcModule from 'kubo-rpc-client'
import ipfsHttpModule from 'ipfs-http-client'

import * as Ctl from 'ipfsd-ctl'

import path from 'path'
import windowOrGlobal from 'window-or-global'
import fs from 'fs'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const { console } = windowOrGlobal

async function run (rpcPort) {
  const endpoint = process.env.E2E_API_URL
  let ipfsd
  let ipfs
  if (endpoint) {
    // create http client for endpoint passed via E2E_API_URL=
    // ipfs = kuboRpcModule.create(endpoint)
    ipfs = ipfsHttpModule(endpoint)
  } else {
    // use ipfds-ctl to spawn daemon to expose http api used for e2e tests
    const type = process.env.E2E_IPFSD_TYPE || 'go'
    const factory = Ctl.createFactory({
      // kuboRpcModule,
      ipfsHttpModule: {
        create: ipfsHttpModule
      },
      ipfsModule: await import('ipfs'),
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
        ipfsBin: process.env.IPFS_GO_EXEC || (await import('go-ipfs')).default.path()
      },
      js: {
        ipfsBin: process.env.IPFS_JS_EXEC || path.resolve(__dirname, '../../../node_modules/ipfs/src/cli.js')
      }
    })

    ipfsd = await factory.spawn({ type })
    ipfs = ipfsd.api
  }
  const { id, agentVersion } = await ipfs.id()

  const { apiHost, apiPort } = ipfs

  if (String(apiPort) !== rpcPort) {
    console.error(`Invalid RPC port returned by IPFS backend: ${apiPort} != ${rpcPort}`)
    await ipfsd.stop()
    process.exit(1)
  }

  const rpcAddr = `/ip4/${apiHost}/tcp/${apiPort}`

  // persist details for e2e tests
  fs.writeFileSync(path.join(__dirname, 'ipfs-backend.json'), JSON.stringify({ rpcAddr, id, agentVersion }))

  console.log(`\nE2E using ${agentVersion} (${endpoint || ipfsd.exec}) with Peer ID ${id} at ${rpcAddr}\n`)

  const teardown = async () => {
    console.log(`Stopping IPFS backend ${id}`)
    await ipfsd.stop()
    process.exit(1)
  }
  process.stdin.resume()
  process.on('SIGINT', teardown)
}

run(process.argv[2])

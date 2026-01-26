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

let ipfsd = null
let ipfs = null

async function run (rpcPort) {
  let gatewayPort = 8080
  if (ipfsd != null && ipfs != null) {
    throw new Error('IPFS backend already running')
  }

  const endpoint = process.env.E2E_API_URL
  if (endpoint) {
    ipfs = create(endpoint)
  } else {
    gatewayPort = await getPort(gatewayPort, '0.0.0.0')

    const kuboBinPath = process.env.IPFS_GO_EXEC || kuboPath()

    const factory = createFactory({
      rpc: create,
      type: 'kubo',
      bin: kuboBinPath,
      init: {
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${rpcPort}`,
            Gateway: `/ip4/127.0.0.1/tcp/${gatewayPort}`
          },
          Bootstrap: [],
          Gateway: {
            NoFetch: true,
            ExposeRoutingAPI: true
          },
          Routing: {
            Type: 'none'
          }
        }
      },
      test: true
    })

    ipfsd = await factory.spawn({ type: 'kubo' })
    ipfs = ipfsd.api
  }

  const { id, agentVersion } = await ipfs.id()

  const { apiHost, apiPort, gatewayHost } = { apiHost: '127.0.0.1', apiPort: rpcPort, gatewayHost: '127.0.0.1' }

  if (Number(apiPort) !== Number(rpcPort)) {
    await ipfsd.stop()
    throw new Error(`Invalid RPC port: ${apiPort} != ${rpcPort}`)
  }

  const rpcAddr = `/ip4/${apiHost}/tcp/${apiPort}`
  const gatewayAddr = `http://${gatewayHost}:${gatewayPort}`

  const configPath = path.join(__dirname, 'ipfs-backend.json')
  fs.writeFileSync(configPath, JSON.stringify({
    rpcAddr,
    id,
    agentVersion,
    apiOpts: {
      host: apiHost,
      port: apiPort,
      protocol: 'http'
    },
    kuboGateway: {
      host: gatewayHost,
      port: gatewayPort,
      protocol: 'http'
    }
  }))

  console.log(`E2E using ${agentVersion} (${endpoint || ipfsd.exec}) id=${id} rpcAddr=${rpcAddr} gatewayAddr=${gatewayAddr}`)

  if (endpoint) {
    return
  }

  const teardown = async () => {
    await ipfsd.stop()
    process.exit(1)
  }
  process.stdin.resume()
  process.on('SIGINT', teardown)
}

async function stop () {
  if (ipfsd) {
    await ipfsd.stop()
    ipfsd = null
    ipfs = null
  }
}

export { run, stop }

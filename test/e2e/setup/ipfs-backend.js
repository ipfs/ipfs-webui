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

// timeout wrapper for async operations that might hang
const withTimeout = (promise, ms, name) => {
  let warningTimer
  const timeout = new Promise((_resolve, reject) => {
    warningTimer = setTimeout(() => {
      console.error(`[ipfs-backend] WARNING: ${name} still running after ${ms * 0.8}ms`)
    }, ms * 0.8)
    setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(warningTimer))
}

let ipfsd
let ipfs
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

    ipfsd = await withTimeout(factory.spawn({ type: 'kubo' }), 30000, 'kubo daemon spawn')
    ipfs = ipfsd.api
  }

  const { id, agentVersion } = await withTimeout(ipfs.id(), 10000, 'ipfs.id()')

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

  console.log(`[ipfs-backend] ${agentVersion} (${endpoint || ipfsd.exec}) id=${id} rpcAddr=${rpcAddr} gatewayAddr=${gatewayAddr}`)

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
    await withTimeout(ipfsd.stop(), 10000, 'ipfsd.stop()')
    ipfsd = null
    ipfs = null
  }
}

export { run, stop }

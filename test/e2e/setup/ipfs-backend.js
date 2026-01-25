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

// log to both stdout and stderr to ensure CI captures output regardless of buffering
const log = (msg) => {
  const line = `[${new Date().toISOString()}] [ipfs-backend] ${msg}\n`
  process.stdout.write(line)
  process.stderr.write(line)
}

// timeout wrapper for async operations that might hang
const withTimeout = (promise, ms, name) => {
  let warningTimer
  const timeout = new Promise((_resolve, reject) => {
    // warn at 80% of timeout
    warningTimer = setTimeout(() => {
      log(`WARNING: ${name} still running after ${ms * 0.8}ms (timeout is ${ms}ms)`)
    }, ms * 0.8)
    setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(warningTimer))
}

let ipfsd
let ipfs
async function run (rpcPort) {
  log('=== IPFS-BACKEND RUN STARTING ===')
  log(`rpcPort=${rpcPort}`)

  let gatewayPort = 8080
  if (ipfsd != null && ipfs != null) {
    log('ERROR: IPFS backend already running')
    throw new Error('IPFS backend already running')
  }

  const endpoint = process.env.E2E_API_URL
  if (endpoint) {
    log(`Using external endpoint: ${endpoint}`)
    ipfs = create(endpoint)
  } else {
    log(`Getting gateway port (preferred: ${gatewayPort})...`)
    gatewayPort = await getPort(gatewayPort, '0.0.0.0')
    log(`Gateway port: ${gatewayPort}`)

    const kuboBinPath = process.env.IPFS_GO_EXEC || kuboPath()
    log(`Kubo binary path: ${kuboBinPath}`)

    log('Creating ipfsd-ctl factory...')
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
    log('Factory created')

    log('Spawning kubo daemon...')
    ipfsd = await withTimeout(factory.spawn({ type: 'kubo' }), 30000, 'kubo daemon spawn')
    log(`Kubo daemon spawned: pid=${ipfsd.subprocess?.pid || 'unknown'}`)
    ipfs = ipfsd.api
  }

  log('Getting node identity...')
  const { id, agentVersion } = await withTimeout(ipfs.id(), 10000, 'ipfs.id()')
  log(`Node identity: id=${id} agent=${agentVersion}`)

  const { apiHost, apiPort, gatewayHost } = { apiHost: '127.0.0.1', apiPort: rpcPort, gatewayHost: '127.0.0.1' }

  if (Number(apiPort) !== Number(rpcPort)) {
    log(`ERROR: Invalid RPC port: ${apiPort} != ${rpcPort}`)
    await ipfsd.stop()
    process.exit(1)
  }

  const rpcAddr = `/ip4/${apiHost}/tcp/${apiPort}`
  const gatewayAddr = `http://${gatewayHost}:${gatewayPort}`

  const configPath = path.join(__dirname, 'ipfs-backend.json')
  log(`Writing config to ${configPath}...`)
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
  log('Config written')

  console.log(`\nE2E using ${agentVersion} (${endpoint || ipfsd.exec})
  Peer ID: ${id}
  rpcAddr: ${rpcAddr}
  gatewayAddr: ${gatewayAddr}`)

  if (endpoint) {
    log('Using external endpoint, returning...')
    return
  }

  log('Setting up SIGINT handler...')
  const teardown = async () => {
    log('SIGINT received, stopping daemon...')
    await ipfsd.stop()
    log('Daemon stopped via SIGINT')
    process.exit(1)
  }
  process.stdin.resume()
  process.on('SIGINT', teardown)
  log('=== IPFS-BACKEND RUN COMPLETE ===')
}

async function stop () {
  log('stop() called')
  if (ipfsd) {
    log('Stopping Kubo daemon...')
    await withTimeout(ipfsd.stop(), 10000, 'ipfsd.stop()')
    log('Kubo daemon stopped')
    ipfsd = null
    ipfs = null
  } else {
    log('No daemon to stop (ipfsd is null)')
  }
}

export { run, stop }

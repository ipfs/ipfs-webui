import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import { exec } from 'node:child_process'
import getPort from 'aegir/get-port'
import { run } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// log to both stdout and stderr to ensure CI captures output regardless of buffering
const log = (msg) => {
  const line = `[${new Date().toISOString()}] [global-setup] ${msg}\n`
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

// check if a port is in use
const checkPort = (port) => new Promise((resolve) => {
  exec(`lsof -i :${port} 2>/dev/null || ss -tlnp 2>/dev/null | grep :${port} || echo "port ${port} appears free"`, (_err, stdout) => {
    log(`Port ${port} status: ${stdout.trim()}`)
    resolve()
  })
})

// make sure that ipfs-backend is fully running
const ensureKuboDaemon = async (apiOpts) => {
  const backendEndpoint = `${apiOpts.protocol}://${apiOpts.host}:${apiOpts.port}`
  log(`ensureKuboDaemon: testing endpoint ${backendEndpoint}`)

  const body = new FormData()
  body.append('file', new Blob(new Uint8Array([1, 2, 3])), 'test.txt')

  log('ensureKuboDaemon: sending block/put request...')
  const fakeFileResult = await withTimeout(
    fetch(`${backendEndpoint}/api/v0/block/put`, { body, method: 'POST' }),
    10000,
    'block/put request'
  )
  if (!fakeFileResult.ok) {
    const text = await fakeFileResult.text()
    log(`ensureKuboDaemon: block/put failed: ${text}`)
    throw new Error(`IPFS backend not running at ${backendEndpoint}`)
  }
  log('ensureKuboDaemon: block/put succeeded')

  const { Key: cidString } = await fakeFileResult.json()
  log(`ensureKuboDaemon: got CID ${cidString}, sending block/get request...`)

  const getContentResult = await withTimeout(
    fetch(`${backendEndpoint}/api/v0/block/get?arg=${cidString}`, { method: 'POST' }),
    10000,
    'block/get request'
  )
  if (!getContentResult.ok) {
    const text = await getContentResult.text()
    log(`ensureKuboDaemon: block/get failed: ${text}`)
    throw new Error(`IPFS backend not running at ${backendEndpoint}`)
  }
  log('ensureKuboDaemon: block/get succeeded, daemon is healthy')
}

const globalSetup = async config => {
  log('=== GLOBAL SETUP STARTING ===')
  log(`Process: PID=${process.pid} platform=${process.platform} arch=${process.arch}`)
  log(`Memory: ${JSON.stringify(process.memoryUsage())}`)
  log(`Node version: ${process.version}`)
  log(`CWD: ${process.cwd()}`)

  const backendJsonPath = path.join(__dirname, 'ipfs-backend.json')

  log('Calling getPort(5001)...')
  let port = await getPort(5001, '0.0.0.0')
  log(`getPort returned: ${port}`)

  if (process.env.E2E_API_URL) {
    const url = new URL(process.env.E2E_API_URL)
    port = url.port
    log(`Using E2E_API_URL port override: ${port}`)
  }

  await checkPort(port)

  log(`Starting ipfs-backend on port ${port}...`)
  await withTimeout(run(port), 60000, 'ipfs-backend startup')
  log('ipfs-backend run() returned')

  // Wait for ipfs-backend.json to be created
  log('Waiting for ipfs-backend.json...')
  let attempts = 0
  const maxAttempts = 10

  while (!fs.existsSync(backendJsonPath) && attempts < maxAttempts) {
    log(`ipfs-backend.json check attempt ${attempts + 1}/${maxAttempts}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
  }

  if (!fs.existsSync(backendJsonPath)) {
    log('ERROR: ipfs-backend.json was not created within 10 seconds')
    throw new Error('ipfs-backend.json was not created within 10 seconds')
  }
  log('ipfs-backend.json found')

  log('Reading ipfs-backend.json...')
  const backendConfig = JSON.parse(fs.readFileSync(backendJsonPath))
  const { rpcAddr, id, agentVersion, apiOpts, kuboGateway } = backendConfig
  log(`Backend config: rpcAddr=${rpcAddr} id=${id} agent=${agentVersion}`)

  process.env.IPFS_RPC_ADDR = rpcAddr
  process.env.IPFS_RPC_ID = id
  process.env.IPFS_RPC_VERSION = agentVersion

  log('Calling ensureKuboDaemon...')
  await withTimeout(ensureKuboDaemon(apiOpts), 30000, 'ensureKuboDaemon')
  log('ensureKuboDaemon completed')

  const { baseURL, storageState } = config.projects[0].use
  log(`Browser setup: baseURL=${baseURL} storageState=${storageState}`)

  log('Launching chromium...')
  const browser = await withTimeout(chromium.launch(), 30000, 'chromium.launch')
  log('Chromium launched')

  log('Creating new page...')
  const page = await browser.newPage()
  log('Page created')

  // capture browser console output for debugging
  page.on('console', msg => log(`Browser console [${msg.type()}]: ${msg.text()}`))
  page.on('pageerror', err => log(`Browser error: ${err.message}`))

  log(`Navigating to ${baseURL}...`)
  await withTimeout(page.goto(baseURL), 30000, 'page.goto')
  log('Navigation complete')

  const rpcEndpoint = `${apiOpts.protocol}://${apiOpts.host}:${apiOpts.port}`
  log(`Setting localStorage with rpcEndpoint=${rpcEndpoint}`)

  log('Running page.evaluate to set localStorage...')
  await page.evaluate(({ kuboGateway, rpcEndpoint }) => {
    localStorage.setItem('kuboGateway', JSON.stringify({ ...kuboGateway, trustlessBlockBrokerConfig: { init: { allowInsecure: true, allowLocal: true } } }))
    localStorage.setItem('ipfsApi', JSON.stringify(rpcEndpoint))
    localStorage.setItem('explore.ipld.gatewayEnabled', 'false')
  }, { rpcEndpoint, kuboGateway })
  log('localStorage set')

  log('Saving storageState...')
  await page.context().storageState({ path: storageState })
  log('storageState saved')

  log('Closing browser...')
  await browser.close()
  log('Browser closed')

  log('=== GLOBAL SETUP COMPLETE ===')
}

export default globalSetup

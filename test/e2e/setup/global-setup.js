import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import getPort from 'aegir/get-port'
import { run } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const log = (msg) => process.stderr.write(`[${new Date().toISOString()}] [global-setup] ${msg}\n`)

// timeout wrapper for async operations that might hang
const withTimeout = (promise, ms, name) => {
  const timeout = new Promise((_resolve, reject) => {
    setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout])
}

// make sure that ipfs-backend is fully running
const ensureKuboDaemon = async (apiOpts) => {
  const backendEndpoint = `${apiOpts.protocol}://${apiOpts.host}:${apiOpts.port}`
  const body = new FormData()
  body.append('file', new Blob(new Uint8Array([1, 2, 3])), 'test.txt')

  const fakeFileResult = await fetch(`${backendEndpoint}/api/v0/block/put`, {
    body,
    method: 'POST'
  })
  if (!fakeFileResult.ok) {
    console.error('fakeFileResult not okay', await fakeFileResult.text())
    throw new Error(`IPFS backend not running at ${backendEndpoint}`)
  }

  const { Key: cidString } = await fakeFileResult.json()
  const getContentResult = await fetch(`${backendEndpoint}/api/v0/block/get?arg=${cidString}`, {
    method: 'POST'
  })
  if (!getContentResult.ok) {
    console.error('Could not get fake file', await getContentResult.text())
    throw new Error(`IPFS backend not running at ${backendEndpoint}`)
  }
}

const globalSetup = async config => {
  log('Starting global setup...')
  const backendJsonPath = path.join(__dirname, 'ipfs-backend.json')
  let port = await getPort(5001, '0.0.0.0')

  if (process.env.E2E_API_URL) {
    const url = new URL(process.env.E2E_API_URL)
    port = url.port
  }
  log(`Starting ipfs-backend on port ${port}...`)
  await withTimeout(run(port), 60000, 'ipfs-backend startup')
  log('ipfs-backend started')
  // Wait for ipfs-backend.json to be created by the webServer
  let attempts = 0
  const maxAttempts = 10 // 10 seconds with 1 second intervals

  while (!fs.existsSync(backendJsonPath) && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
  }

  if (!fs.existsSync(backendJsonPath)) {
    throw new Error('ipfs-backend.json was not created within 10 seconds')
  }

  // Read and expose backend info in env availables inside of test() blocks
  const { rpcAddr, id, agentVersion, apiOpts, kuboGateway } = JSON.parse(fs.readFileSync(backendJsonPath))
  process.env.IPFS_RPC_ADDR = rpcAddr
  process.env.IPFS_RPC_ID = id
  process.env.IPFS_RPC_VERSION = agentVersion

  await ensureKuboDaemon(apiOpts)

  // Set and save RPC API endpoint in storageState, so test start against
  // desired endpoint
  const { baseURL, storageState } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(baseURL)

  const rpcEndpoint = `${apiOpts.protocol}://${apiOpts.host}:${apiOpts.port}`

  // use page.evaluate (not addInitScript) to set localStorage values immediately
  // so they are captured by storageState() before the browser closes
  await page.evaluate(({ kuboGateway, rpcEndpoint }) => {
    localStorage.setItem('kuboGateway', JSON.stringify({ ...kuboGateway, trustlessBlockBrokerConfig: { init: { allowInsecure: true, allowLocal: true } } }))
    localStorage.setItem('ipfsApi', JSON.stringify(rpcEndpoint))
    localStorage.setItem('explore.ipld.gatewayEnabled', 'false') // disable gateway network requests when testing e2e
  }, { rpcEndpoint, kuboGateway })
  await page.context().storageState({ path: storageState })
  await browser.close()
  log('Global setup complete')
}

export default globalSetup

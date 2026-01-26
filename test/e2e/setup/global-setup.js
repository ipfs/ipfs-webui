import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'
import getPort from 'aegir/get-port'
import { run } from './ipfs-backend.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// timeout wrapper for async operations that might hang
const withTimeout = (promise, ms, name) => {
  let warningTimer
  const timeout = new Promise((_resolve, reject) => {
    warningTimer = setTimeout(() => {
      console.error(`[global-setup] WARNING: ${name} still running after ${ms * 0.8}ms`)
    }, ms * 0.8)
    setTimeout(() => reject(new Error(`${name} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(warningTimer))
}

// make sure that ipfs-backend is fully running
const ensureKuboDaemon = async (apiOpts) => {
  const backendEndpoint = `${apiOpts.protocol}://${apiOpts.host}:${apiOpts.port}`

  const body = new FormData()
  body.append('file', new Blob(new Uint8Array([1, 2, 3])), 'test.txt')

  const fakeFileResult = await withTimeout(
    fetch(`${backendEndpoint}/api/v0/block/put`, { body, method: 'POST' }),
    10000,
    'block/put request'
  )
  if (!fakeFileResult.ok) {
    throw new Error(`IPFS backend not running at ${backendEndpoint}`)
  }

  const { Key: cidString } = await fakeFileResult.json()

  const getContentResult = await withTimeout(
    fetch(`${backendEndpoint}/api/v0/block/get?arg=${cidString}`, { method: 'POST' }),
    10000,
    'block/get request'
  )
  if (!getContentResult.ok) {
    throw new Error(`IPFS backend not running at ${backendEndpoint}`)
  }
}

const globalSetup = async config => {
  console.log('[global-setup] starting')

  const backendJsonPath = path.join(__dirname, 'ipfs-backend.json')

  let port = await getPort(5001, '0.0.0.0')

  if (process.env.E2E_API_URL) {
    const url = new URL(process.env.E2E_API_URL)
    port = url.port
  }

  await withTimeout(run(port), 60000, 'ipfs-backend startup')

  // Wait for ipfs-backend.json to be created
  let attempts = 0
  const maxAttempts = 10

  while (!fs.existsSync(backendJsonPath) && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++
  }

  if (!fs.existsSync(backendJsonPath)) {
    throw new Error('ipfs-backend.json was not created within 10 seconds')
  }

  const backendConfig = JSON.parse(fs.readFileSync(backendJsonPath))
  const { rpcAddr, id, agentVersion, apiOpts, kuboGateway } = backendConfig

  process.env.IPFS_RPC_ADDR = rpcAddr
  process.env.IPFS_RPC_ID = id
  process.env.IPFS_RPC_VERSION = agentVersion

  await withTimeout(ensureKuboDaemon(apiOpts), 30000, 'ensureKuboDaemon')

  const { baseURL, storageState } = config.projects[0].use

  const browser = await withTimeout(chromium.launch(), 30000, 'chromium.launch')
  const page = await browser.newPage()

  await withTimeout(page.goto(baseURL), 30000, 'page.goto')

  const rpcEndpoint = `${apiOpts.protocol}://${apiOpts.host}:${apiOpts.port}`

  await page.evaluate(({ kuboGateway, rpcEndpoint }) => {
    localStorage.setItem('kuboGateway', JSON.stringify({ ...kuboGateway, trustlessBlockBrokerConfig: { init: { allowInsecure: true, allowLocal: true } } }))
    localStorage.setItem('ipfsApi', JSON.stringify(rpcEndpoint))
    localStorage.setItem('explore.ipld.gatewayEnabled', 'false')
  }, { rpcEndpoint, kuboGateway })

  await page.context().storageState({ path: storageState })
  await browser.close()

  console.log(`[global-setup] complete (id=${id} agent=${agentVersion})`)
}

export default globalSetup

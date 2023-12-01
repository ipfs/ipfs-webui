import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  // Read and expose backend info in env availables inside of test() blocks
  const { rpcAddr, id, agentVersion, apiOpts, kuboGateway } = JSON.parse(fs.readFileSync(path.join(__dirname, 'ipfs-backend.json')))
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

  await page.context().addInitScript(({ kuboGateway, rpcEndpoint }) => {
    localStorage.setItem('kuboGateway', JSON.stringify(kuboGateway))
    localStorage.setItem('ipfsApi', JSON.stringify(rpcEndpoint))
    localStorage.setItem('explore.ipld.gatewayEnabled', 'false') // disable gateway network requests when testing e2e
  }, { rpcEndpoint, kuboGateway })
  await page.context().storageState({ path: storageState })
  await browser.close()
}

export default globalSetup

import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const globalSetup = async config => {
  // Read and expose backend info in env availables inside of test() blocks
  const { rpcAddr, id, agentVersion, apiOpts } = JSON.parse(fs.readFileSync(path.join(__dirname, 'ipfs-backend.json')))
  process.env.IPFS_RPC_ADDR = rpcAddr
  process.env.IPFS_RPC_ID = id
  process.env.IPFS_RPC_VERSION = agentVersion

  // Set and save RPC API endpoint in storageState, so test start against
  // desired endpoint
  const { baseURL, storageState } = config.projects[0].use
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(baseURL)

  await page.context().addInitScript((apiOpts) => {
    localStorage.setItem('ipfsApi', JSON.stringify(apiOpts))
    localStorage.setItem('explore.ipld.gatewayEnabled', 'false') // disable gateway network requests when testing e2e
  }, apiOpts)
  await page.context().storageState({ path: storageState })
  await browser.close()
}

export default globalSetup

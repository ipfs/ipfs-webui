import { test, expect } from './setup/coverage.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import ipfsHttpClient from 'ipfs-http-client'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test.describe('Explore screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/explore')
  })

  test('should have Project Apollo Archive as one of examples', async ({ page }) => {
    await page.waitForSelector('a[href="#/explore/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D"]')
    await page.waitForSelector('text=Project Apollo Archives')
    await page.waitForSelector('text=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')
  })

  test('should open arbitrary CID', async ({ page }) => {
    // add a local file to repo so test is fast and works in offline mode
    const cid = 'bafkreicgkmwhdunxgdqwqveecdo3wqmgulb4azm6sfnrtvd7g47mnrixji'
    const expectedData = readFileSync(join(__dirname, '../../LICENSE'), 'utf8')
    const ipfs = ipfsHttpClient(process.env.IPFS_RPC_ADDR)
    const result = await ipfs.add(expectedData, { cidVersion: 1 })
    await expect(result.cid.toString()).toStrictEqual(cid)

    // open inspector
    await page.goto(`/#/explore/${cid}`)
    // await page.waitForSelector(`a[href="#/explore/${cid}"]`)
    // expect node type
    await page.waitForSelector('text=Raw Block')
    // expect cid details
    await page.waitForSelector('text=base32 - cidv1 - raw - sha2-256~256~46532C71D1B730E168548410DDBB4186A2C3C0659E915B19D47F373EC6C5174A')
  })
})

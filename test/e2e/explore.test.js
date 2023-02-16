import { test, expect } from './setup/coverage.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import * as kuboRpcModule from 'kubo-rpc-client'
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
    const ipfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)
    const result = await ipfs.add(expectedData, { cidVersion: 1 })
    await expect(result.cid.toString()).toStrictEqual(cid)

    // open inspector
    await page.goto(`/#/explore/${cid}`)
    // await page.waitForSelector(`a[href="#/explore/${cid}"]`)
    // expect node type
    await page.waitForSelector('text=bafkreicgkmwhdunxgdqwqveecdo3wqmgulb4azm6sfnrtvd7g47mnrixji')
    await page.waitForSelector('text=Raw Block')
    // expect cid details
    await page.waitForSelector('text=base32 - cidv1 - raw - sha2-256~256~46532C71D1B730E168548410DDBB4186A2C3C0659E915B19D47F373EC6C5174A')
  })

  test('should open unixFS CID', async ({ page }) => {
    // test.slow();
    const cid = 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'

    // open inspector
    await page.goto(`/#/explore/${cid}`)
    const spinner = page.locator('.la-ball-triangle-path')
    await spinner.waitFor({ state: 'hidden' })
    // expect node type
    // await page.waitForSelector('.joyride-explorer-node')
    await page.waitForSelector('text=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')
    await page.waitForSelector('[title="dag-pb"]')
    // await page.waitForSelector('"dag-pb"')
    // await page.waitForSelector('text=UnixFS')
    // // expect cid details
    // await page.waitForSelector('text=base58btc - cidv0 - dag-pb - sha2-256~256~422896A1CE82A7B1CC0BA27C7D8DE2886C7DF95588473D')
  })

  test('should open unixFS CID2', async ({ page }) => {
    // test.slow();
    const cid = 'QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm'

    // open inspector
    await page.goto(`/#/explore/${cid}`)
    const spinner = page.locator('.la-ball-triangle-path')
    await spinner.waitFor({ state: 'hidden' })
    // expect node type
    await page.waitForSelector('text=QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm')
    await page.waitForSelector('[title="dag-pb"]')
    // await page.waitForSelector('text=dag-pb')
    // await page.waitForSelector('text=UnixFS')
    // expect cid details
    // await page.waitForSelector('text=base58btc - cidv0 - dag-pb - sha2-256~256~E536C7F88D731F374DCCB568AFF6F56E838A19382E4880')
  })


  test('should open dag-cbor cid', async ({ page }) => {
    // test.slow();
    // const cid = 'bafyreihnpl7ami7esahkfdnemm6idx4r2n6u3apmtcrxlqwuapgjsciihy'
    // const cid = 'bafyreigyjpb4hum3prop73k2ttpeikeeq636jtcpdjeytjrogh436vs2lu'
    // const cid = 'zdpuAzE1oAAMpsfdoexcJv6PmL9UhE8nddUYGU32R98tzV5fv'
    const cid = 'bafyreiengp2sbi6ez34a2jctv34bwyjl7yoliteleaswgcwtqzrhmpyt2m'

    // open inspector
    await page.goto(`/#/explore/${cid}`)
    const spinner = page.locator('.la-ball-triangle-path')
    await spinner.waitFor({ state: 'hidden' })
    // const foo = page.locator('.joyride-explorer-cid')
    // await foo.waitFor({ state: 'attached' })
    // await spinner.waitFor({ state: 'hidden' })
    // await page.waitForSelector(`a[href="#/explore/${cid}"]`)
    // expect node type
    // await page.waitForSelector('[title="dag-cbor"]')
    // await page.waitForSelector('text=bafyreihnpl7ami7esahkfdnemm6idx4r2n6u3apmtcrxlqwuapgjsciihy')
    // await page.waitForSelector('text=bafyreigyjpb4hum3prop73k2ttpeikeeq636jtcpdjeytjrogh436vs2lu')
    // await page.waitForSelector('text=zdpuAzE1oAAMpsfdoexcJv6PmL9UhE8nddUYGU32R98tzV5fv')
    await page.waitForSelector('text=bafyreiengp2sbi6ez34a2jctv34bwyjl7yoliteleaswgcwtqzrhmpyt2m')
    // await page.waitForSelector('text=dag-cbor')
    // // expect cid details
    // await page.waitForSelector('text=base32 - cidv1 - dag-cbor - sha2-256~256~ED7AFE0623E4900EA28DA4633C81DF91D37D4D81EC98A37')
  })
})

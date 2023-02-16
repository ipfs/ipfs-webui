import { test, expect } from './setup/coverage.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import * as kuboRpcModule from 'kubo-rpc-client'
import { fileURLToPath } from 'url'
import {encode, decode} from '@ipld/dag-cbor'
import * as dagCbor from '@ipld/dag-cbor'
import {CID} from 'multiformats/cid'
import uint8ArrayFromString from 'uint8arrays/from-string.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test.describe('Explore screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/explore')
    await page.waitForSelector('.joyride-app-status .teal') // '.joyride-app-status .red' means disconnected.
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

    // expect node type
    await page.waitForSelector(`"${cid}"`)
    await page.waitForSelector('[title="raw"]')
    await page.waitForSelector('text=Raw Block')

    // expect cid details
    await page.waitForSelector('text=base32 - cidv1 - raw - sha2-256~256~46532C71D1B730E168548410DDBB4186A2C3C0659E915B19D47F373EC6C5174A')
  })

  test('should open cidv0 dag-pb unixFS CID', async ({ page }) => {
    test.slow();
    const cid = 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D'

    await page.fill('[data-id="FilesExploreForm"] input[id="ipfs-path"]', cid);
    await page.press('[data-id="FilesExploreForm"] button[title="Inspect"]', 'Enter');

    // open inspector
    // await page.goto(`/#/explore/${cid}`)
    await page.waitForURL(`/#/explore/${cid}`);
    // await page.waitForSelector('.e2e-explorePage')
    // const html = await page.content()
    // const explorePage = page.locator('.e2e-explorePage')
    // await explorePage.waitFor({ state: 'attached' })
    const spinner = page.locator('.la-ball-triangle-path')
    await spinner.waitFor({ state: 'hidden', timeout: 30000 })
    // expect node type
    // await page.waitForSelector('.joyride-explorer-node')
    await page.waitForSelector(`"${cid}"`)
    await page.waitForSelector('[title="dag-pb"]')
    // const foo = await page.locator('section > [title="dag-pb"] > a').innerText()
    // console.log(`foo: `, foo);
    // const nodeType = await page.$('[title="dag-pb"]')
    // expect(await nodeType.$eval('a', el => el.innerText)).toBe('UnixFS')
    // // expect cid details
    // await page.waitForSelector('#CidInfo-human-readable-cid')
    // const foo = await page.locator('#CidInfo-human-readable-cid').innerText()
    console.log(`await page.content(): `, await page.content());
    const foo = await page.$eval('#CidInfo-human-readable-cid', firstRes => firstRes.textContent);
    console.log(`foo: `, foo);
    // console.log(`await foo.innerText(): `, await foo.innerText());

    // await page.waitForSelector('"base58btc - cidv0 - dag-pb - sha2-256~256~422896A1CE82A7B1CC0BA27C7D8DE2886C7DF95588473D5E88A28A9FCFA0E43E"')
    await page.waitForSelector('"base58btc"')
    await page.waitForSelector('"cidv0"')
    await page.waitForSelector('"dag-pb"')
    await page.waitForSelector('"sha2-256"')
  })

  test('should open unixFS CID2', async ({ page }) => {
    // test.slow();
    const cid = 'QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm'

    // open inspector
    await page.goto(`/#/explore/${cid}`)

    // wait for spinner
    const spinner = page.locator('.la-ball-triangle-path')
    await spinner.waitFor({ state: 'hidden' })

    // expect node type
    await page.waitForSelector(`"${cid}"`)
    await page.waitForSelector('[title="dag-pb"]')
    // await page.waitForSelector('text=dag-pb')
    // await page.waitForSelector('text=UnixFS')

    // expect cid details
    // await page.waitForSelector('text=base58btc - cidv0 - dag-pb - sha2-256~256~E536C7F88D731F374DCCB568AFF6F56E838A19382E4880')
  })


  test('should open dag-cbor cid', async ({ page }) => {
    const ipfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)

    const dagJsonCborNode = {
      data: uint8ArrayFromString('hello world')
    }

    // add bytes to backend node so that explore page can load the content
    const cidInstance = await ipfs.dag.put(dagJsonCborNode, {
      storeCodec: 'dag-cbor',
      hashAlg: 'sha2-256'
    })
    const cborCid = cidInstance.toString()
    console.log(`cborCid: `, cborCid);

    // open inspector
    await page.goto(`/#/explore/${cborCid}`)

    // wait for loading
    const spinner = page.locator('.la-ball-triangle-path')
    await spinner.waitFor({ state: 'hidden' })

    // expect node type
    await page.waitForSelector(`"${cborCid}"`)
    await page.waitForSelector('[title="dag-cbor"]')
    // await page.waitForSelector('text=dag-cbor')
    // // expect cid details
    // await page.waitForSelector('text=base32 - cidv1 - dag-cbor - sha2-256~256~ED7AFE0623E4900EA28DA4633C81DF91D37D4D81EC98A37')
  })
})

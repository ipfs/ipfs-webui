import { test, expect } from './setup/coverage.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import * as kuboRpcModule from 'kubo-rpc-client'
import { fileURLToPath } from 'url'
import {CID} from 'multiformats/cid'
import * as dagPb from '@ipld/dag-pb'
import {sha256} from 'multiformats/hashes/sha2'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 *
 * @template {number} Code
 * @param {any} value
 * @param {import('multiformats/block').BlockEncoder<Code, any>} codec
 * @param {import('multiformats/hashes/interface').MultihashHasher<Code>} hasher
 * @returns
 */
const createCID = async (value, codec, hasher, version = 1) => {
  try {
    const digest = await hasher.digest(codec.encode(value))
    return CID.create(version, codec.code, digest)
  } catch (err) {
    console.log('Failed to create CID', value, err)
    return null
  }
}

async function testExploredCid ({ cid, type, humanReadableCID, page }) {
  await page.fill('[data-id="FilesExploreForm"] input[id="ipfs-path"]', cid);
  await page.press('[data-id="FilesExploreForm"] button[title="Inspect"]', 'Enter');

  // wait for loading
  const spinner = page.locator('.la-ball-triangle-path')
  await spinner.waitFor({ state: 'hidden' })

  // expect node type
  await page.waitForSelector(`"${cid}"`)
  await page.waitForSelector(`[title="${type}"]`)

  // expect cid details
  await page.waitForSelector('#CidInfo-human-readable-cid')
  const actualHumanReadableCID = await page.$eval('#CidInfo-human-readable-cid', firstRes => firstRes.textContent);
  expect(actualHumanReadableCID).toBe(humanReadableCID)
  // console.log(`actualHumanReadableCID: `, actualHumanReadableCID);
  // await page.waitForSelector(`"${humanReadableCID}"`)
}

test.describe('Explore screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/explore')
    await page.waitForSelector('.joyride-app-status .teal') // '.joyride-app-status .red' means disconnected.
  })

  test.describe('Start Exploring', () => {
    test('should have Project Apollo Archive as one of examples', async ({ page }) => {
      await page.waitForSelector('a[href="#/explore/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D"]')
      await page.waitForSelector('text=Project Apollo Archives')
      await page.waitForSelector('text=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')
    })
  })

  test.describe('Inspecting CID', () => {
    test('should open raw CID', async ({ page }) => {
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

    test('should open dag-pb', async ({ page }) => {

      const ipfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)
      const cidData = new Uint8Array(Buffer.from('hello world'))
      const dagPbAsDagJson = {
        Data: cidData,
        Links: []
      }
      const cid = await createCID(dagPbAsDagJson, dagPb, sha256, 0)

      // add bytes to backend node so that explore page can load the content
      const cidInstance = await ipfs.dag.put(dagPbAsDagJson, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })
      const dagPbCid = cidInstance.toString()

      await testExploredCid({
        page,
        cid: cid.toString(),
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~543AA6F6B9A533C8BF80568090CDF24B693AAA2F9B574A33784D8462FDC5579C',
        type: 'dag-pb'
      })

      await testExploredCid({
        page,
        cid: dagPbCid,
        humanReadableCID: 'base32 - cidv1 - dag-pb - sha2-256~256~543AA6F6B9A533C8BF80568090CDF24B693AAA2F9B574A33784D8462FDC5579C',
        type: 'dag-pb'
      })
    })

    test('should open dag-cbor cid', async ({ page }) => {
      const ipfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)
      const type = 'dag-cbor'
      const cidData = new Uint8Array(Buffer.from('hello world'))
      const dagCborAsDagJson = {
        data: cidData,
      }

      // add bytes to backend node so that explore page can load the content
      const cidInstance = await ipfs.dag.put(dagCborAsDagJson, {
        storeCodec: type,
        hashAlg: 'sha2-256'
      })
      const cborCid = cidInstance.toString()

      await testExploredCid({
        page,
        cid: cborCid,
        humanReadableCID: 'base32 - cidv1 - dag-cbor - sha2-256~256~497BC2F17946B7E5DE05715EB348E47F2A6ABE6CF34ECAE9F46E236BC6E49FF5',
        type
      })
    })

    test('should open dag-pb unixFS XKCD Archives', async ({ page }) => {
      await testExploredCid({
        page,
        cid: 'QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~E536C7F88D731F374DCCB568AFF6F56E838A19382E488039B1CA8AD2599E82FE',
        type: 'dag-pb'
      })
      await page.waitForSelector('"UnixFS"')
    })
  });

})

import { readFile } from 'fs/promises'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import { create } from 'kubo-rpc-client'
import { CID } from 'multiformats/cid'
import * as dagPb from '@ipld/dag-pb'
import { sha256 } from 'multiformats/hashes/sha2'

import { test, expect } from './setup/coverage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 *
 * @template {number} Code
 * @param {any} value
 * @param {import('multiformats/block').BlockEncoder<Code, any>} codec
 * @param {import('multiformats/hashes/interface').MultihashHasher<Code>} hasher
 * @returns {CID | null}
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

/**
 * Fills out the explore form (optional), waits for CID of given type to be loaded, and checks if CID details are correct.
 * @param {object} options
 * @param {import('playwright').Page} options.page
 * @param {string} options.cid
 * @param {string} options.type
 * @param {string} [options.humanReadableCID]
 * @param {boolean} [options.fillOutForm]
 */
async function testExploredCid ({ cid, type, humanReadableCID, page, fillOutForm = true }) {
  if (fillOutForm) {
    await page.fill('[data-id="FilesExploreForm"] input[id="ipfs-path"]', cid)
    await page.press('[data-id="FilesExploreForm"] button[title="Inspect"]', 'Enter')
  }

  await page.waitForSelector(`.joyride-explorer-cid [title="${cid}"]`) // cid is displayed in the CID INFO section.
  await page.waitForSelector(`[title="${type}"]`)

  if (humanReadableCID != null) {
    // expect cid details
    await page.waitForSelector('#CidInfo-human-readable-cid')
    const actualHumanReadableCID = await page.$eval('#CidInfo-human-readable-cid', firstRes => firstRes.textContent)
    expect(actualHumanReadableCID).toBe(humanReadableCID)
  }
}

/**
 * Loads saved block fixtures from fixtures/explore/blocks and adds them locally to the ipfs node
 * @param {object} param0
 * @param {import('kubo-rpc-client').IPFSHTTPClient} param0.ipfs
 * @param {string|string[]} param0.blockCid
 * @param {object} param0.blockPutArgs
 */
async function loadBlockFixtures ({ ipfs, blockCid, blockPutArgs = { format: 'v0' } }) {
  try {
    if (Array.isArray(blockCid)) {
      return await Promise.all(blockCid.map(cid => loadBlockFixtures({ ipfs, blockCid: cid, blockPutArgs })))
    }
    // read the data from the file
    const data = await readFile(join(__dirname, '/fixtures/explore/blocks', blockCid), { encoding: '' })
    // add the data to the ipfs node
    const result = await ipfs.block.put(data, blockPutArgs)
    // check that the CID returned from block.put matches the given block fixture CID
    expect(result.toString()).toBe(blockCid)
  } catch (e) {
    console.error(e)
  }
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
    /**
     * @type {ReturnType<import('kubo-rpc-client')['create']>}
     */
    let ipfs
    test.beforeEach(async () => {
      ipfs = create(process.env.IPFS_RPC_ADDR)
    })

    test('should open raw CID', async ({ page }) => {
      // add a local file to repo so test is fast and works in offline mode
      const cid = 'bafkreicgkmwhdunxgdqwqveecdo3wqmgulb4azm6sfnrtvd7g47mnrixji'
      const expectedData = readFileSync(join(__dirname, '../../LICENSE'), 'utf8')
      const result = await ipfs.add(expectedData, { cidVersion: 1 })
      await expect(result.cid.toString()).toStrictEqual(cid)

      await testExploredCid({
        cid,
        page,
        type: 'raw',
        humanReadableCID: 'base32 - cidv1 - raw - sha2-256~256~46532C71D1B730E168548410DDBB4186A2C3C0659E915B19D47F373EC6C5174A'
      })
    })

    test('should open dag-pb', async ({ page }) => {
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
      const type = 'dag-cbor'
      const cid = 'bafyreicds4picvqi46ljgw2eombkoifaftyjgd4abvfvledghftn2xnena'

      await loadBlockFixtures({
        ipfs,
        blockCid: [
          cid
        ],
        blockPutArgs: {
          storeCodec: type,
          format: type,
          version: 1,
          hashAlg: 'sha2-256'
        }
      })

      await testExploredCid({
        page,
        cid,
        humanReadableCID: 'base32 - cidv1 - dag-cbor - sha2-256~256~43971E815608E796935B447302A720A02CF0930F800D4B5590663966DD5DA468',
        type
      })
    })

    test('should open dag-pb unixFS XKCD Archives', async ({ page }) => {
      await loadBlockFixtures({
        ipfs,
        blockCid: [
          'QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm',
          'QmbQDovX7wRe9ek7u6QXe9zgCXkTzoUSsTFJEkrYV1HrVR',
          'QmawceGscqN4o8Y8Fv26UUmB454kn2bnkXV5tEQYc4jBd6'
        ]
      })

      await testExploredCid({
        page,
        cid: 'QmdmQXB2mzChmMeKY47C43LxUdg1NDJ5MWcKMKxDu7RgQm',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~E536C7F88D731F374DCCB568AFF6F56E838A19382E488039B1CA8AD2599E82FE',
        type: 'dag-pb'
      })
      await page.waitForSelector('"UnixFS"')

      await (await page.waitForSelector('"QmbQDovX7wRe9ek7u6QXe9zgCXkTzoUSsTFJEkrYV1HrVR"')).click()
      await testExploredCid({
        fillOutForm: false,
        page,
        cid: 'QmbQDovX7wRe9ek7u6QXe9zgCXkTzoUSsTFJEkrYV1HrVR',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~C212195DE60CE9B899EFDB2830101B16556018A24C7428E32198FAAB9D493F94',
        type: 'dag-pb'
      })

      await (await page.waitForSelector('"QmawceGscqN4o8Y8Fv26UUmB454kn2bnkXV5tEQYc4jBd6"')).click()
      await testExploredCid({
        fillOutForm: false,
        page,
        cid: 'QmawceGscqN4o8Y8Fv26UUmB454kn2bnkXV5tEQYc4jBd6',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~BB413C3DE0BA745523A3D701D6CB4283BCA7E187EC21556F4456036F692A5075',
        type: 'dag-pb'
      })
    })

    test('should explore Project Apollo Archive', async ({ page }) => {
      await loadBlockFixtures({
        ipfs,
        blockCid: [
          'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D',
          'QmeQtZfwuq6aWRarY9P3L9MWhZ6QTonDe9ahWECGBZjyEJ',
          'QmVmf9vLEdWeBjh74kTibHVkim6iLsRXs5jhHzbSdWjoLt',
          'QmT4hPa6EeeCaTAb4a6ddFf4Lk5da9C1f4nMBmMJgbAW3z',
          'QmZA6h4vP17Ktw5vyMdSQNTvzsncQKDSifYwJznY461rY2',
          'QmR2pm6hPxv7pEgNaPE477rVBNSZnbUgXsSn2R9RqK9tAH'
        ]
      })

      await testExploredCid({
        page,
        cid: 'QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~422896A1CE82A7B1CC0BA27C7D8DE2886C7DF95588473D5E88A28A9FCFA0E43E',
        type: 'dag-pb'
      })

      await (await page.waitForSelector('"QmeQtZfwuq6aWRarY9P3L9MWhZ6QTonDe9ahWECGBZjyEJ"')).click()
      await testExploredCid({
        page,
        cid: 'QmeQtZfwuq6aWRarY9P3L9MWhZ6QTonDe9ahWECGBZjyEJ',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~EED0FABF56CC4483BD066183A55EDC7817D3549C394C1967521B35AAC9D51FF3',
        type: 'dag-pb',
        fillOutForm: false
      })

      await (await page.waitForSelector('"QmVmf9vLEdWeBjh74kTibHVkim6iLsRXs5jhHzbSdWjoLt"')).click()
      await testExploredCid({
        page,
        cid: 'QmVmf9vLEdWeBjh74kTibHVkim6iLsRXs5jhHzbSdWjoLt',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~6E69D4FA6F373B9DAC05974C31CAE53A8F39A0C67A6895CAC1DD2B274C079B19',
        type: 'dag-pb',
        fillOutForm: false
      })

      await (await page.waitForSelector('"QmT4hPa6EeeCaTAb4a6ddFf4Lk5da9C1f4nMBmMJgbAW3z"')).click()
      await testExploredCid({
        page,
        cid: 'QmT4hPa6EeeCaTAb4a6ddFf4Lk5da9C1f4nMBmMJgbAW3z',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~46342C25ED0D9CA0BCB2350DB258941A08BDFC0064E824FE39FBEB2171D604E9',
        type: 'dag-pb',
        fillOutForm: false
      })

      await (await page.waitForSelector('"QmZA6h4vP17Ktw5vyMdSQNTvzsncQKDSifYwJznY461rY2"')).click()
      await testExploredCid({
        page,
        cid: 'QmZA6h4vP17Ktw5vyMdSQNTvzsncQKDSifYwJznY461rY2',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~A0BC8B9BA2A4F6A91311F259A648F259723F7C6E13061E42462FC15FE6E1CA5B',
        type: 'dag-pb',
        fillOutForm: false
      })

      await (await page.waitForSelector('"QmR2pm6hPxv7pEgNaPE477rVBNSZnbUgXsSn2R9RqK9tAH"')).click()
      await testExploredCid({
        page,
        cid: 'QmR2pm6hPxv7pEgNaPE477rVBNSZnbUgXsSn2R9RqK9tAH',
        humanReadableCID: 'base58btc - cidv0 - dag-pb - sha2-256~256~2801F8B9FF4924F0938CBAF0F53B43E68088DBE272C6905C8D7AAA21A67102A6',
        type: 'dag-pb',
        fillOutForm: false
      })
    })
  })
})

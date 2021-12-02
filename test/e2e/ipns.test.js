/* global webuiUrl, ipfs, page, describe, it, beforeAll, afterAll, expect */

const { createController } = require('ipfsd-ctl')

describe('IPNS publishing', () => {
  const keyName = 'pet-name-e2e-ipns-test'
  let ipfsd
  let peeraddr

  beforeAll(async () => {
    // spawn a second ephemeral local node as a peer for ipns publishing
    ipfsd = await createController({
      type: 'go',
      ipfsBin: require('go-ipfs').path(),
      ipfsHttpModule: require('ipfs-http-client'),
      test: true,
      disposable: true
    })
    const { addresses } = await ipfsd.api.id()
    peeraddr = addresses.find((ma) => ma.toString().startsWith('/ip4/127.0.0.1')).toString()
  })

  describe('Settings screen', () => {
    beforeAll(async () => {
      await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
    })
    it('should list IPNS keys', async () => {
      await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
      // confirm the self key is displayed
      await waitForIPNSKeyList(ipfs, 'self')
    })

    it('should have a clickable "Generate key" button', async () => {
      const genKey = 'text=Generate Key'
      await page.waitForSelector(genKey)
      await page.click(genKey)
      await page.waitForSelector('div[role="dialog"]')
      await page.waitForSelector('text=Enter pet name of key to create')
    })

    it('should list new IPNS key with provided pet name ', async () => {
      // provide key name
      await page.type('div[role="dialog"] input[type="text"]', keyName)
      // hit Enter
      await page.keyboard.type('\n')
      // expect it to be added to key list under provided pet name
      await waitForIPNSKeyList(ipfs, 'self')
    })
  })

  describe('Files screen', () => {
    beforeAll(async () => {
      await page.goto(webuiUrl + '#/files', { waitUntil: 'networkidle' })
    })

    const testFilename = 'ipns-test.txt'
    const testCid = '/ipfs/bafyaaeqkcaeaeeqknfyg44znorsxg5akdafa'

    it('should have "Publish to IPNS" context action', async () => {
      // first: create a test file
      const button = 'button[id="import-button"]'
      await page.waitForSelector(button, { state: 'visible' })
      await page.click(button)
      await page.waitForSelector('#add-by-path', { state: 'visible' })
      page.click('button[id="add-by-path"]')
      await page.waitForSelector('div[role="dialog"] input[name="name"]')
      await page.fill('div[role="dialog"] input[name="path"]', testCid)
      await page.fill('div[role="dialog"] input[name="name"]', testFilename)
      await page.keyboard.type('\n')
      // expect file with matching filename to be added to the file list
      await page.waitForSelector(`.File:has-text("${testFilename}")`)
      // click on the context menu
      await page.click(`.File:has-text('${testFilename}') .file-context-menu`)
      // click on the IPNS action
      await page.waitForSelector(`.File:has-text("${testFilename}")`)
      // expect IPNS action to be present in the context menu
      await page.waitForSelector('button:has-text("Publish to IPNS")')
    })

    it('should allow selecting IPNS keys', async () => {
      // .. continue by clicking on context action
      await page.click('button:has-text("Publish to IPNS")')
      await page.waitForSelector('div[role="dialog"] .publishModalKeys')
      await page.click(`div[role="dialog"] .publishModalKeys button:has-text("${keyName}")`)
      await page.click(`text=${keyName}`)
      const publishButton = 'div[role="dialog"] button:has-text("Publish")'
      const enabled = await page.isEnabled(publishButton)
      expect(enabled).toBeTruthy()
      // connect to other peer to have something in the peer table
      // (ipns will fail to publish without peers)
      await ipfs.swarm.connect(peeraddr)
      await page.click(publishButton)
      await page.waitForSelector('text=Successfully published')
      await page.click('button:has-text("Copy")')
      // confirm IPNS record in local store points at the CID
      const { id } = (await ipfs.key.list()).filter(k => k.name === keyName)[0]
      for await (const name of ipfs.name.resolve(`/ipns/${id}`, { recursive: true })) {
        expect(name).toEqual(testCid)
      }
    })
  })

  afterAll(async () => {
    if (ipfsd) await ipfsd.stop()
  })
})

// Confirm contents of IPNS Publishing Keys table on Settings screen
// are in sync with ipfs.key.list
async function waitForIPNSKeyList (ipfs, specificKey) {
  await page.waitForSelector('text=IPNS Publishing Keys')
  if (specificKey) await page.waitForSelector(`text=${specificKey}`)
  for (const { id, name } of await ipfs.key.list()) {
    await page.waitForSelector(`text=${id}`)
    await page.waitForSelector(`text=${name}`)
  }
}

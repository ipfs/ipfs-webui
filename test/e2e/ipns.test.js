const { test, expect } = require('@playwright/test')
const { createController } = require('ipfsd-ctl')
const ipfsClient = require('ipfs-http-client')

test.describe('IPNS publishing', () => {
  const keyName = 'pet-name-e2e-ipns-test'
  let ipfsd
  let peeraddr

  test.beforeAll(async () => {
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

  test.describe('Settings screen', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/settings')
    })
    test('should list IPNS keys', async ({ page }) => {
      // confirm the self key is displayed
      const ipfs = ipfsClient(process.env.IPFS_RPC_ADDR)
      await waitForIPNSKeyList(ipfs, 'self', page)
    })

    test('should support adding new keys', async ({ page }) => {
      // open dialog
      const genKey = 'text=Generate Key'
      await page.waitForSelector(genKey)
      await page.click(genKey)
      await page.waitForSelector('div[role="dialog"]')
      // expect prompt for key name
      await page.waitForSelector('text=Enter pet name of key to create')
      // provide key name
      const selector = 'div[role="dialog"] input[type="text"]'
      await page.type(selector, keyName)
      // hit Enter
      await page.press(selector, 'Enter')
      // expect it to be added to key list under provided pet name
      const ipfs = ipfsClient(process.env.IPFS_RPC_ADDR)
      await waitForIPNSKeyList(ipfs, 'self', page)
    })
  })

  test.describe('Files screen', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/#/files')
    })

    const testFilename = 'ipns-test.txt'
    const testCid = '/ipfs/bafyaaeqkcaeaeeqknfyg44znorsxg5akdafa'

    test('should have functional "Publish to IPNS" context action', async ({ page }) => {
      // first: create a test file
      const button = 'button[id="import-button"]'
      await page.waitForSelector(button, { state: 'visible' })
      await page.click(button)
      await page.waitForSelector('#add-by-path', { state: 'visible' })
      page.click('button[id="add-by-path"]')
      await page.waitForSelector('div[role="dialog"] input[name="name"]')
      await page.fill('div[role="dialog"] input[name="path"]', testCid)
      await page.fill('div[role="dialog"] input[name="name"]', testFilename)
      await page.keyboard.press('Enter')
      // expect file with matching filename to be added to the file list
      await page.waitForSelector(`.File:has-text("${testFilename}")`)
      // click on the context menu
      await page.click(`.File:has-text('${testFilename}') .file-context-menu`)
      // click on the IPNS action
      await page.waitForSelector(`.File:has-text("${testFilename}")`)
      // expect IPNS action to be present in the context menu
      await page.waitForSelector('button:has-text("Publish to IPNS")')
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
      const ipfs = ipfsClient(process.env.IPFS_RPC_ADDR)
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

  test.afterAll(async () => {
    if (ipfsd) await ipfsd.stop()
  })
})

// Confirm contents of IPNS Publishing Keys table on Settings screen
// are in sync with ipfs.key.list
async function waitForIPNSKeyList (ipfs, specificKey, page) {
  await page.waitForSelector('text=IPNS Publishing Keys')
  if (specificKey) await page.waitForSelector(`text=${specificKey}`)
  for (const { id, name } of await ipfs.key.list()) {
    await page.waitForSelector(`text=${id}`)
    await page.waitForSelector(`text=${name}`)
  }
}

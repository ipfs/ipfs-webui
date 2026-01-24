import { test, expect } from './setup/coverage.js'
import { createNode } from 'ipfsd-ctl'
import { path as kuboPath } from 'kubo'
import { create } from 'kubo-rpc-client'

// TODO: Fix parallelism of these tests
test.describe.configure({ mode: 'serial' })

test.describe('IPNS publishing', () => {
  let ipfsd
  let peeraddr

  test.beforeAll(async () => {
    // spawn a second ephemeral local node as a peer for ipns publishing
    ipfsd = await createNode({
      type: 'kubo',
      bin: process.env.IPFS_GO_EXEC || kuboPath(),
      rpc: create,
      test: true,
      disposable: true
    })
    const { addresses } = await ipfsd.api.id()
    peeraddr = addresses.find((ma) => ma.toString().startsWith('/ip4/127.0.0.1')).toString()
  })

  test.describe('Settings screen', () => {
    let ipfs
    test.beforeEach(async ({ page }) => {
      ipfs = create(process.env.IPFS_RPC_ADDR)
      await page.goto('/#/settings')
    })
    test('should list IPNS keys', async ({ page }) => {
      // confirm the self key is displayed
      await waitForIPNSKeyList(ipfs, 'self', page)
    })

    test('should support adding new keys', async ({ page }) => {
      const keyName = 'pet-name-e2e-ipns-test-' + new Date().getTime()
      // open dialog
      const genKey = 'text=Generate Key'
      await page.locator(genKey).waitFor()
      await page.locator(genKey).click()

      // Wait for the modal to appear
      await page.locator('[data-testid="ipfs-modal"]').waitFor()

      // expect prompt for key name
      await page.locator('text=Enter a nickname for this key to generate').waitFor()
      // provide key name
      const selector = 'input.modal-input'
      await page.locator(selector).fill(keyName)
      // hit Enter
      await page.locator(selector).press('Enter')
      // expect it to be added to key list under provided pet name
      await waitForIPNSKeyList(ipfs, keyName, page)
    })

    test('should support removing keys', async ({ page }) => {
      // create key that we want to remove
      const rmKeyName = 'rm-key-test-' + new Date().getTime()
      const { id } = await ipfs.key.gen(rmKeyName)
      await page.reload()
      // remove key via UI on Settings page
      await page.locator(`text=${rmKeyName}`).waitFor()
      await page.locator(`text=${rmKeyName}${id} >> [aria-label="Show options"]`).click()
      await page.locator('text=Rename').waitFor()
      await page.locator('button[role="menuitem"]:has-text("Remove")').click()
      await page.locator('text=Confirm IPNS Key Removal').waitFor()
      await page.locator('button:has-text("Remove")').click()
      await page.locator(`text=${rmKeyName}`).waitFor({ state: 'detached' })
      for (const { name } of await ipfs.key.list()) {
        expect(name).not.toEqual(rmKeyName)
      }
    })
  })

  test.describe('Files screen', () => {
    let keyName
    let ipfs
    test.beforeEach(async ({ page }) => {
      keyName = 'pet-name-e2e-ipns-test-' + new Date().getTime() + Math.random().toString(16).slice(2)
      ipfs = create(process.env.IPFS_RPC_ADDR)
      await ipfs.key.gen(keyName)
      await page.goto('/#/files')
      await page.reload()
    })
    test.afterEach(async () => {
      await ipfs.key.rm(keyName)
      ipfs = null
    })

    const testFilename = 'ipns-test.txt'
    const testCid = '/ipfs/bafyaaeqkcaeaeeqknfyg44znorsxg5akdafa'

    test('should have functional "Publish to IPNS" context action', async ({ page }) => {
      // first: create a test file
      const button = 'button[id="import-button"]'
      await page.locator(button).waitFor({ state: 'visible' })
      await page.locator(button).click()
      await page.locator('#add-by-path').waitFor({ state: 'visible' })
      await page.locator('button[id="add-by-path"]').click()
      await page.locator('div[role="dialog"] input[name="name"]').waitFor()
      await page.locator('div[role="dialog"] input[name="path"]').fill(testCid)
      await page.locator('div[role="dialog"] input[name="name"]').fill(testFilename)
      await page.keyboard.press('Enter')
      // expect file with matching filename to be added to the file list
      await page.locator(`.File:has-text("${testFilename}")`).waitFor()
      // click on the context menu
      await page.locator(`.File:has-text('${testFilename}') .file-context-menu`).click()
      // click on the IPNS action
      await page.locator(`.File:has-text("${testFilename}")`).waitFor()
      // expect IPNS action to be present in the context menu
      await page.locator('button:has-text("Publish to IPNS")').waitFor()
      // .. continue by clicking on context action
      await page.locator('button:has-text("Publish to IPNS")').click()
      await page.locator('div[role="dialog"] .publishModalKeys').waitFor()
      await page.locator(`div[role="dialog"] .publishModalKeys button:has-text("${keyName}")`).click()
      await page.locator(`text=${keyName}`).click()
      const publishButton = 'div[role="dialog"] button:has-text("Publish")'
      const enabled = await page.locator(publishButton).isEnabled()
      expect(enabled).toBeTruthy()
      // connect to other peer to have something in the peer table
      // (ipns will fail to publish without peers)
      await ipfs.swarm.connect(peeraddr)
      await page.locator(publishButton).click()
      await page.locator('text=Successfully published').waitFor()
      await page.locator('button:has-text("Done")').click()
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
  await page.locator('text=IPNS Publishing Keys').waitFor()
  if (specificKey) await page.locator(`text=${specificKey}`).waitFor()
  for (const { id, name } of await ipfs.key.list()) {
    if (name.startsWith('rm-key-test-')) continue // avoid race with removal tests
    await page.locator(`text=${id}`).waitFor()
    await page.locator(`text=${name}`).waitFor()
  }
}

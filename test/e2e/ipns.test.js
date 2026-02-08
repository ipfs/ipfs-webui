import { test, expect } from './setup/coverage.js'
import { files, ipns, modal, dismissImportNotification } from './setup/locators.js'
import { create } from 'kubo-rpc-client'

// serial mode due to shared IPNS key state
test.describe.configure({ mode: 'serial' })

test.describe('IPNS publishing', () => {
  // Use worker-scoped peerNode fixture from fixtures.js for IPNS publishing
  // (ipns will fail to publish without peers)

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
      const genKey = ipns.generateKeyButton(page)
      await expect(genKey).toBeVisible()
      await genKey.click()

      // Wait for the modal to appear
      await expect(modal.container(page)).toBeVisible()

      // expect prompt for key name
      await expect(page.getByText('Enter a nickname for this key to generate')).toBeVisible()

      // provide key name
      const input = modal.input(page)
      await input.fill(keyName)

      // hit Enter
      await input.press('Enter')

      // expect it to be added to key list under provided pet name
      await waitForIPNSKeyList(ipfs, keyName, page)
    })

    test('should support removing keys', async ({ page }) => {
      // create key that we want to remove
      const rmKeyName = 'rm-key-test-' + new Date().getTime()
      const { id } = await ipfs.key.gen(rmKeyName)
      await page.reload()

      // remove key via UI on Settings page
      await expect(page.getByText(rmKeyName)).toBeVisible()
      await page.locator(`text=${rmKeyName}${id} >> [aria-label="Show options"]`).click()

      await expect(page.getByText('Rename')).toBeVisible()
      await ipns.removeMenuItem(page).click()

      await expect(page.getByText('Confirm IPNS Key Removal')).toBeVisible()
      await page.getByRole('button', { name: 'Remove' }).click()

      await expect(page.getByText(rmKeyName)).toBeHidden()

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
      // dismiss any lingering import notification from previous tests
      await dismissImportNotification(page)
    })

    test.afterEach(async () => {
      await ipfs.key.rm(keyName)
      ipfs = null
    })

    const testFilename = 'ipns-test.txt'
    const testCid = '/ipfs/bafyaaeqkcaeaeeqknfyg44znorsxg5akdafa'

    test('should have functional "Publish to IPNS" context action', async ({ page, peerAddr }) => {
      // first: create a test file via "Add by path"
      const importButton = files.importButton(page)
      await expect(importButton).toBeVisible()
      await importButton.click()

      await expect(files.addByPathOption(page)).toBeVisible()
      await files.addByPathOption(page).click()

      // wait for dialog inputs to be visible (dialog may have animation)
      const pathInput = files.dialogInput(page, 'path')
      await expect(pathInput).toBeVisible()

      await pathInput.fill(testCid)
      await files.dialogInput(page, 'name').fill(testFilename)
      await page.keyboard.press('Enter')

      // Wait for the dialog to close before proceeding
      await expect(pathInput).not.toBeVisible({ timeout: 10000 })
      
      // Also wait for the modal overlay to be completely gone
      await page.locator('[aria-label="Close modal"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})

      // expect file with matching filename to be added to the file list
      const fileRow = page.getByTestId('file-row').filter({ hasText: testFilename })
      await expect(fileRow).toBeVisible()

      // click on the context menu
      await page.locator(`.File:has-text('${testFilename}') .file-context-menu`).click()

      // expect IPNS action to be present in the context menu (menu items use role="menuitem")
      const publishMenuItem = files.contextMenuItem(page, 'Publish to IPNS')
      await expect(publishMenuItem).toBeVisible()

      // click on context action
      await publishMenuItem.click()

      await expect(ipns.publishModalKeys(page)).toBeVisible()
      await page.locator(`div[role="dialog"] .publishModalKeys button:has-text("${keyName}")`).click()
      await page.getByText(keyName).click()

      const publishButton = ipns.publishButton(page)
      await expect(publishButton).toBeEnabled()

      // connect to other peer to have something in the peer table
      // (ipns will fail to publish without peers)
      await ipfs.swarm.connect(peerAddr)

      // dismiss import notification created earlier in this test
      await dismissImportNotification(page)

      await publishButton.click()

      // IPNS publishing can take time depending on network/DHT conditions
      await expect(page.getByText('Successfully published')).toBeVisible({ timeout: 30000 })
      await ipns.doneButton(page).click()

      // confirm IPNS record in local store points at the CID
      const { id } = (await ipfs.key.list()).filter(k => k.name === keyName)[0]
      for await (const name of ipfs.name.resolve(`/ipns/${id}`, { recursive: true })) {
        expect(name).toEqual(testCid)
      }
    })
  })
})

// Confirm contents of IPNS Publishing Keys table on Settings screen
// are in sync with ipfs.key.list
async function waitForIPNSKeyList (ipfs, specificKey, page) {
  await expect(page.getByText('IPNS Publishing Keys')).toBeVisible()
  if (specificKey) await expect(page.getByText(specificKey)).toBeVisible()
  for (const { id, name } of await ipfs.key.list()) {
    if (name.startsWith('rm-key-test-')) continue // avoid race with removal tests
    await expect(page.getByText(id)).toBeVisible()
    await expect(page.getByText(name)).toBeVisible()
  }
}

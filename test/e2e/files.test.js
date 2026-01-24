import { test } from './setup/coverage.js'
import { fixtureData } from './fixtures/index.js'
import all from 'it-all'
import filesize from 'filesize'
import * as kuboRpcModule from 'kubo-rpc-client'

test.describe('Files screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/files')
  })

  const button = 'button[id="import-button"]'

  test('should have the active Add menu', async ({ page }) => {
    await page.locator(button).waitFor({ state: 'visible' })
    await page.locator(button).click()
    await page.locator('#add-file').waitFor({ state: 'visible' })
    await page.locator('button#add-file').waitFor()
    await page.locator('button#add-folder').waitFor()
    await page.locator('button#add-by-path').waitFor()
    await page.locator('button#add-new-folder').waitFor()
    // close menu with Escape key
    await page.keyboard.press('Escape')
  })

  test('should allow for a successful import of two files', async ({ page }) => {
    await page.locator(button).waitFor({ state: 'visible' })
    await page.locator(button).click()
    await page.locator('#add-file').waitFor({ state: 'visible' })

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('button[id="add-file"]').click() // menu button that triggers file selection
    ])

    //  select a single static text file via fileChooser
    const file1 = fixtureData('file.txt')
    const file2 = fixtureData('file2.txt')
    await fileChooser.setFiles([file1.path, file2.path])

    // expect file with matching filename to be added to the file list
    await page.locator('.File').first().waitFor()
    await page.locator('.File:has-text("file.txt")').waitFor()
    await page.locator('.File:has-text("file2.txt")').waitFor()

    // expect valid CID to be present on the page
    const ipfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)
    const [result1, result2] = await all(ipfs.addAll([file1.data, file2.data]))
    await page.locator(`text=${result1.cid.toString()}`).first().waitFor()
    await page.locator(`text=${result2.cid.toString()}`).first().waitFor()

    // expect human readable sizes in format from ./src/lib/files.js#humanSize
    // this ensures metadata was correctly read for each item in the MFS
    const human = (b) => (b
      ? filesize(b, {
        standard: 'iec',
        base: 2,
        round: b >= 1073741824 ? 1 : 0
      })
      : '-')
    // only check the files we just uploaded (not all MFS files, which may include files from other tests)
    for (const fileName of ['file.txt', 'file2.txt']) {
      const stat = await ipfs.files.stat(`/${fileName}`)
      // verify file row exists and shows the correct size
      const fileRow = page.locator(`.File:has-text("${fileName}")`)
      await fileRow.waitFor()
      await fileRow.locator(`text=${human(stat.size)}`).waitFor()
    }
  })

  test('should have active Context menu that allows Inspection of the DAG', async ({ page }) => {
    // dedicated test file to make this isolated from the rest
    const testFilename = 'explorer-context-menu-test.txt'
    const testCid = 'bafkqaddjnzzxazldoqwxizltoq'

    // first: create a test file
    const button = 'button[id="import-button"]'
    await page.locator(button).waitFor({ state: 'visible' })
    await page.locator(button).click()
    await page.locator('#add-by-path').waitFor({ state: 'visible' })
    await page.locator('button[id="add-by-path"]').click()
    await page.locator('div[role="dialog"] input[name="name"]').waitFor()
    await page.locator('div[role="dialog"] input[name="path"]').fill(`/ipfs/${testCid}`)
    await page.locator('div[role="dialog"] input[name="name"]').fill(testFilename)
    await page.keyboard.press('Enter')
    // expect file with matching filename to be added to the file list
    await page.locator(`.File:has-text("${testFilename}")`).waitFor()

    // open context menu
    const cbutton = `button[aria-label="View more options for ${testFilename}"]`
    await page.locator(cbutton).waitFor({ state: 'visible' })
    await page.locator(cbutton).click()
    await page.locator('button[role="menuitem"]:has-text("Inspect")').waitFor({ state: 'visible' })

    // click on Inspect option
    await page.locator('button[role="menuitem"]:has-text("Inspect")').click()

    // confirm Explore screen was opened with correct CID
    await page.waitForURL(`/#/explore/${testCid}`)
    await page.locator('text="CID info"').waitFor()
  })
})

import { test, expect } from './setup/coverage.js'
import { fixtureData } from './fixtures/index.js'
import { files, explore } from './setup/locators.js'
import all from 'it-all'
import filesize from 'filesize'
import * as kuboRpcModule from 'kubo-rpc-client'

test.describe('Files screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/files')
  })

  test('should have the active Add menu', async ({ page }) => {
    const importButton = files.importButton(page)
    await expect(importButton).toBeVisible()
    await importButton.click()

    await expect(files.addFileOption(page)).toBeVisible()
    await expect(files.addFolderOption(page)).toBeVisible()
    await expect(files.addByPathOption(page)).toBeVisible()
    await expect(files.addNewFolderOption(page)).toBeVisible()
    await expect(page.getByText('Bulk import')).toBeVisible()

    // close menu with Escape key
    await page.keyboard.press('Escape')
  })

  test('should allow for a successful import of two files', async ({ page }) => {
    const importButton = files.importButton(page)
    await expect(importButton).toBeVisible()
    await importButton.click()

    await expect(files.addFileOption(page)).toBeVisible()

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      files.addFileOption(page).click()
    ])

    // select static text files via fileChooser
    const file1 = fixtureData('file.txt')
    const file2 = fixtureData('file2.txt')
    await fileChooser.setFiles([file1.path, file2.path])

    // expect files to be added to the file list
    const fileRow1 = page.getByTestId('file-row').filter({ hasText: 'file.txt' })
    const fileRow2 = page.getByTestId('file-row').filter({ hasText: 'file2.txt' })
    await expect(fileRow1).toBeVisible()
    await expect(fileRow2).toBeVisible()

    // expect valid CID to be present on the page
    const ipfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)
    const [result1, result2] = await all(ipfs.addAll([file1.data, file2.data]))
    await expect(page.getByText(result1.cid.toString()).first()).toBeVisible()
    await expect(page.getByText(result2.cid.toString()).first()).toBeVisible()

    // expect human readable sizes in format from ./src/lib/files.js#humanSize
    const human = (b) => (b
      ? filesize(b, {
        standard: 'iec',
        base: 2,
        round: b >= 1073741824 ? 1 : 0
      })
      : '-')

    // only check the files we just uploaded
    for (const fileName of ['file.txt', 'file2.txt']) {
      const stat = await ipfs.files.stat(`/${fileName}`)
      const fileRow = page.getByTestId('file-row').filter({ hasText: fileName })
      await expect(fileRow).toBeVisible()
      await expect(fileRow.getByText(human(stat.size))).toBeVisible()
    }
  })

  test('should have active Context menu that allows Inspection of the DAG', async ({ page }) => {
    // dedicated test file to make this isolated from the rest
    const testFilename = 'explorer-context-menu-test.txt'
    const testCid = 'bafkqaddjnzzxazldoqwxizltoq'

    // first: create a test file via "Add by path"
    const importButton = files.importButton(page)
    await expect(importButton).toBeVisible()
    await importButton.click()

    await expect(files.addByPathOption(page)).toBeVisible()
    await files.addByPathOption(page).click()

    // wait for dialog inputs to be visible (dialog may have animation)
    const pathInput = files.dialogInput(page, 'path')
    await expect(pathInput).toBeVisible()

    await pathInput.fill(`/ipfs/${testCid}`)
    await files.dialogInput(page, 'name').fill(testFilename)
    await page.keyboard.press('Enter')

    // expect file with matching filename to be added to the file list
    const fileRow = page.getByTestId('file-row').filter({ hasText: testFilename })
    await expect(fileRow).toBeVisible()

    // open context menu
    const contextButton = files.contextMenuButton(page, testFilename)
    await expect(contextButton).toBeVisible()
    await contextButton.click()

    const inspectMenuItem = files.contextMenuItem(page, 'Inspect')
    await expect(inspectMenuItem).toBeVisible()

    // click on Inspect option
    await inspectMenuItem.click()

    // confirm Explore screen was opened with correct CID
    await page.waitForURL(`/#/explore/${testCid}`)
    await expect(page.getByText('CID info')).toBeVisible()
  })

  test('should successfully import file via Add by path', async ({ page }) => {
    // bafkqac3imvwgy3zao5xxe3de is the inlined CID for "hello world"
    const testCid = 'bafkqac3imvwgy3zao5xxe3de'
    const testPath = `/ipfs/${testCid}`
    const testFilename = 'add-by-path-test.txt'

    // Open Import menu and click "From IPFS"
    const importButton = files.importButton(page)
    await expect(importButton).toBeVisible()
    await importButton.click()

    await expect(files.addByPathOption(page)).toBeVisible()
    await files.addByPathOption(page).click()

    // Fill in the dialog
    const pathInput = files.dialogInput(page, 'path')
    await expect(pathInput).toBeVisible()
    await pathInput.fill(testPath)
    await files.dialogInput(page, 'name').fill(testFilename)

    // Click Import button
    const importDialogButton = page.getByRole('button', { name: 'Import' })
    await expect(importDialogButton).toBeVisible()
    await importDialogButton.click()

    // Wait for dialog to close
    await expect(pathInput).not.toBeVisible({ timeout: 10000 })

    // Verify file appears in the file list with the correct CID
    const fileRow = page.getByTestId('file-row').filter({ hasText: testFilename })
    await expect(fileRow).toBeVisible({ timeout: 30000 })
    await expect(fileRow.getByText(testCid).first()).toBeVisible()
  })

  // Regression test: trailing slash in path should be handled correctly
  test('should successfully import path with trailing slash', async ({ page }) => {
    const testCid = 'bafkqac3imvwgy3zao5xxe3de'
    // Path with trailing slash - should still work
    const testPath = `/ipfs/${testCid}/`
    const testFilename = 'trailing-slash-test.txt'

    await files.importButton(page).click()
    await files.addByPathOption(page).click()
    const pathInput = files.dialogInput(page, 'path')
    await expect(pathInput).toBeVisible()
    await pathInput.fill(testPath)
    await files.dialogInput(page, 'name').fill(testFilename)
    await page.keyboard.press('Enter')

    // Wait for dialog to close
    await expect(pathInput).not.toBeVisible({ timeout: 10000 })

    // Verify file appears with the custom filename
    const fileRow = page.getByTestId('file-row').filter({ hasText: testFilename })
    await expect(fileRow).toBeVisible({ timeout: 30000 })
  })

  test('should show error notification when importing non-existent path', async ({ page }) => {
    // bafkqac3imvwgy3zao5xxe3de is the inlined CID for "hello world" (a file, not a dir)
    // Trying to access /404 inside it fails because you can't traverse into a file
    const nonExistentPath = '/ipfs/bafkqac3imvwgy3zao5xxe3de/404'

    // Open Import menu and click "From IPFS"
    const importButton = files.importButton(page)
    await expect(importButton).toBeVisible()
    await importButton.click()

    await expect(files.addByPathOption(page)).toBeVisible()
    await files.addByPathOption(page).click()

    // Fill in the dialog with the non-existent path
    const pathInput = files.dialogInput(page, 'path')
    await expect(pathInput).toBeVisible()
    await pathInput.fill(nonExistentPath)

    // Click Import button to submit
    const importDialogButton = page.getByRole('button', { name: 'Import' })
    await expect(importDialogButton).toBeVisible()
    await importDialogButton.click()

    // Wait for the dialog to close (the path input should disappear)
    await expect(pathInput).not.toBeVisible({ timeout: 10000 })

    // Wait for any import notification to appear
    const notification = page.locator('.fileImportStatus')
    await expect(notification).toBeVisible({ timeout: 30000 })

    // The notification should show "Failed to import" instead of "Imported 0 items"
    const errorNotification = page.locator('.fileImportStatus').filter({ hasText: /Failed to import/i })
    await expect(errorNotification).toBeVisible()

    // Verify error styling is applied (red background)
    const errorContainer = page.locator('.fileImportStatusError')
    await expect(errorContainer).toBeVisible()

    // Verify the path is shown in the error details (in the fileImportStatusName span)
    await expect(notification.locator('.fileImportStatusName').filter({ hasText: nonExistentPath })).toBeVisible()

    // Verify the actual error message is displayed (in the dark-red error div)
    const errorDetail = notification.locator('.dark-red.f7')
    await expect(errorDetail).toBeVisible()
    // Verify it contains the expected error from IPFS
    await expect(errorDetail).toContainText('cp: cannot get node from path')
  })

  // Regression test: ensure previous import errors are cleared when starting a new import.
  // Without the fix in doFilesAddPath, the second (successful) import would show
  // "Failed to import 2 items" because errors from previous imports accumulate.
  test('should clear previous errors when starting new import', async ({ page }) => {
    const validPath = '/ipfs/bafkqac3imvwgy3zao5xxe3de'
    const invalidPath = '/ipfs/bafkqac3imvwgy3zao5xxe3de/404'
    // Use unique filename to avoid conflicts when tests run in parallel
    const uniqueFilename = `clear-errors-test-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`

    // First, import an invalid path to create an error
    await files.importButton(page).click()
    await files.addByPathOption(page).click()
    await files.dialogInput(page, 'path').fill(invalidPath)
    await page.getByRole('button', { name: 'Import' }).click()

    // Wait for error notification
    const notification = page.locator('.fileImportStatus')
    await expect(notification.filter({ hasText: /Failed to import 1 item/i })).toBeVisible({ timeout: 30000 })

    // Verify error styling IS present after failed import
    const errorContainer = page.locator('.fileImportStatusError')
    await expect(errorContainer).toBeVisible()

    // Now import a valid path with a unique filename to avoid conflicts with other parallel tests
    await files.importButton(page).click()
    await expect(files.addByPathOption(page)).toBeVisible()
    await files.addByPathOption(page).click()
    const pathInput = files.dialogInput(page, 'path')
    await expect(pathInput).toBeVisible()
    await pathInput.fill(validPath)
    await files.dialogInput(page, 'name').fill(uniqueFilename)
    // Press Enter to submit (notification overlaps Import button at bottom of screen)
    await page.keyboard.press('Enter')

    // Wait for success notification title - should show "Imported 1 item", not "Failed to import"
    const notificationTitle = notification.locator('.fileImportStatusButton span').first()
    await expect(notificationTitle).toHaveText('Imported 1 item', { timeout: 30000 })

    // Verify success styling - no error class on the header
    await expect(errorContainer).not.toBeVisible()

    // Expand the drawer to check items (click on the header button)
    const drawerButton = notification.locator('.fileImportStatusButton')
    // Ensure drawer is expanded (aria-expanded="true")
    const isExpanded = await drawerButton.getAttribute('aria-expanded')
    if (isExpanded !== 'true') {
      await drawerButton.click()
    }

    // Verify BOTH items shown in drawer (failed + successful)
    await expect(notification.locator('.fileImportStatusName').filter({ hasText: invalidPath })).toBeVisible()
    await expect(notification.locator('.fileImportStatusName').filter({ hasText: uniqueFilename })).toBeVisible()
  })

  test('should show error page when navigating to non-existing path', async ({ page }) => {
    // bafyaabakaieac is CIDv1 of an empty directory, so /404 inside it does not exist
    const nonExistingPath = '/ipfs/bafyaabakaieac/404'

    // enter the path in the explore form input and click Browse
    await explore.cidInput(page).fill(nonExistingPath)
    await expect(explore.browseButton(page)).toBeEnabled()
    await explore.browseButton(page).click()

    // expect error page to be displayed with the correct title
    await expect(page.getByRole('heading', { name: 'Unable to load this path' })).toBeVisible()

    // expect the path to be displayed in the error message area (below the heading)
    await expect(page.locator('p.truncate').filter({ hasText: 'bafyaabakaieac/404' })).toBeVisible()

    // expect the "Go to Files" button to be present and working
    const goToFilesButton = page.getByRole('link', { name: 'Go to Files' })
    await expect(goToFilesButton).toBeVisible()
    await goToFilesButton.click()

    // confirm navigation back to files root
    await page.waitForURL('/#/files')
  })
})

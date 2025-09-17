import { test, expect } from '@playwright/test'
import { navigateToFilesPage, addTestFiles, selectViewMode } from '../helpers/grid'

test.describe('Files grid view', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to files page and switch to grid view
    await navigateToFilesPage(page)

    await selectViewMode(page, 'grid')

    // ensure we have test files to work with
    const fileCount = await page.locator('.grid-file, .file-row').count()
    if (fileCount < 3) {
      // Only add test files if we don't have enough
      await addTestFiles(page, 'files', 5) // Adds 5 test files
    }
  })

  test('should display files in grid view', async ({ page }) => {
    // Check that the grid container is visible
    const gridContainer = page.locator('.files-grid')
    await expect(gridContainer).toBeVisible()

    // Check that at least one grid item is visible
    const gridItems = page.locator('.grid-file')
    await expect(gridItems.first()).toBeVisible()
  })

  test('should focus and navigate with arrow keys', async ({ page }) => {
    // Press right arrow to focus the first item
    await page.keyboard.press('ArrowRight')

    // Check if the first item is focused
    const firstFocusedItem = page.locator('.grid-file.focused')
    await expect(firstFocusedItem).toBeVisible()

    // Navigate using arrow keys (right, down, left, up)
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.grid-file.focused')).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('.grid-file.focused')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('.grid-file.focused')).toBeVisible()
    await page.keyboard.press('ArrowUp')
    await expect(page.locator('.grid-file.focused')).toBeVisible()
  })

  test('should select files with space key', async ({ page }) => {
    // Navigate to first item
    await page.keyboard.press('ArrowRight')

    await page.keyboard.press('Space')

    // Verify selection
    const selectedCount = await page.locator('.selected').count()
    expect(selectedCount).toBe(1)

    // Move to another item
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')

    // Select multiple items
    await page.keyboard.press('Space')

    // Verify multiple selection
    const multiSelectedCount = await page.locator('.selected').count()
    expect(multiSelectedCount).toBe(2)
  })

  test('should deselect files with space key', async ({ page }) => {
    // Focus and select first item
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')

    // Verify selection
    let selectedCount = await page.locator('.selected').count()
    expect(selectedCount).toBe(1)

    await page.keyboard.press('ArrowRight')

    // Deselect with space
    await page.keyboard.press('Space')

    // Verify deselection
    selectedCount = await page.locator('.selected').count()
    expect(selectedCount).toBe(0)
  })

  test('should scroll into view when focusing files out of viewport', async ({ page }) => {
    // Make sure we have enough files to create scrolling
    if (await page.locator('.grid-file').count() < 20) {
      await addTestFiles(page, 'files', 20)
    }
    await page.reload()
    await selectViewMode(page, 'grid')

    // Navigate to first item
    await page.keyboard.press('ArrowRight')

    // Press down many times to get to items that would be out of view
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown')
    }

    // Verify the focused item is visible in viewport
    const focusedItem = page.locator('.grid-file.focused')
    await expect(focusedItem).toBeVisible()
  })

  test('should enter folder with Enter key', async ({ page }) => {
    // Ensure we have some files/folders in the grid
    const totalFiles = await page.locator('.grid-file').count()

    if (totalFiles === 0) {
      // Create a test file first
      await page.locator('button[aria-label="Import"], button:has-text("Import")').click()
      await page.locator('input[type="file"]').setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test content')
      })
      await page.waitForSelector('.grid-file[title="test.txt"]')
    }

    // Check if a folder exists, if not create one
    const folderExists = await page.locator('.grid-file[data-type="directory"]').count() > 0

    if (!folderExists) {
      // Create a folder if none exists
      await page.locator('button[aria-label="Import"], button:has-text("Import")').click()
      await page.locator('button#add-new-folder').click()
      await page.locator('input.modal-input').fill('test-folder')
      await page.locator('button', { hasText: 'Create' }).click()

      // Wait for folder to appear
      await page.waitForSelector('.grid-file[title="test-folder"]')
    }

    // Find the first folder
    const folder = page.locator('.grid-file[title$="/"], .grid-file[data-type="directory"]').first()

    // Store current URL to detect navigation
    const currentUrl = page.url()

    // Try double-clicking the folder directly to navigate
    await folder.dblclick()

    // Wait for navigation to occur
    await page.waitForFunction((url) => window.location.href !== url, currentUrl, { timeout: 10000 })

    // Verify we navigated to the folder
    expect(page.url()).not.toBe(currentUrl)
  })
})

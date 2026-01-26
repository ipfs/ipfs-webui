import { test, expect } from './setup/coverage.js'
import { files } from './setup/locators.js'
import { navigateToFilesPage, addTestFiles, selectViewMode } from '../helpers/grid'

/**
 * Focus the grid container and ensure keyboard navigation is active.
 * Throws if focus cannot be established after retries.
 */
async function focusGrid (page) {
  const gridContainer = page.getByTestId('files-grid')
  await expect(gridContainer).toBeVisible()

  // try multiple approaches to establish focus
  const approaches = [
    async () => {
      await gridContainer.click({ position: { x: 10, y: 10 } })
      await page.keyboard.press('ArrowRight')
    },
    async () => {
      await gridContainer.focus()
      await page.keyboard.press('ArrowRight')
    },
    async () => {
      // click on first grid item then use arrow
      const firstItem = page.getByTestId('grid-file').first()
      await firstItem.click()
      await page.keyboard.press('ArrowRight')
    }
  ]

  for (const approach of approaches) {
    await approach()
    try {
      await expect(page.locator('.grid-file.focused')).toBeVisible({ timeout: 1000 })
      return // success
    } catch {
      // try next approach
    }
  }

  throw new Error('Could not establish keyboard focus on grid after multiple attempts')
}

test.describe('Files grid view', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToFilesPage(page)
    await selectViewMode(page, 'grid')

    // ensure we have test files to work with
    const fileCount = await page.getByTestId('grid-file').count()
    if (fileCount < 3) {
      await addTestFiles(page, 'files', 5)
    }
  })

  test('should display files in grid view', async ({ page }) => {
    const gridContainer = page.getByTestId('files-grid')
    await expect(gridContainer).toBeVisible()

    const gridItems = page.getByTestId('grid-file')
    await expect(gridItems.first()).toBeVisible()
  })

  test('should focus and navigate with arrow keys', async ({ page }) => {
    await focusGrid(page)
    await expect(page.locator('.grid-file.focused')).toBeVisible()

    // navigate with arrow keys and verify focus persists
    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']) {
      await page.keyboard.press(key)
      await expect(page.locator('.grid-file.focused')).toBeVisible()
    }
  })

  test('should select files with space key', async ({ page }) => {
    await focusGrid(page)

    // select current item
    await page.keyboard.press('Space')
    await expect(page.locator('.selected')).toHaveCount(1)

    // move to another item and select it too
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')
    await expect(page.locator('.selected')).toHaveCount(2)
  })

  test('should deselect files with space key', async ({ page }) => {
    await focusGrid(page)

    // select first item
    await page.keyboard.press('Space')
    await expect(page.locator('.selected')).toHaveCount(1)

    // move and toggle selection (deselects because we moved away)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')
    await expect(page.locator('.selected')).toHaveCount(0)
  })

  test('should scroll into view when focusing files out of viewport', async ({ page }) => {
    // ensure enough files for scrolling
    if (await page.getByTestId('grid-file').count() < 20) {
      await addTestFiles(page, 'files', 20)
    }
    await page.reload()
    await selectViewMode(page, 'grid')

    await focusGrid(page)

    // navigate down multiple times
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowDown')
    }

    // focused item should still be visible (scrolled into view)
    await expect(page.locator('.grid-file.focused')).toBeVisible()
  })

  test('should enter folder with Enter key', async ({ page }) => {
    // ensure a folder exists
    const folderExists = await page.locator('[data-testid="grid-file"][data-type="directory"]').count() > 0
    if (!folderExists) {
      await files.importButton(page).click()
      await files.addNewFolderOption(page).click()
      await files.modalInput(page).fill('test-folder')
      await page.getByRole('button', { name: 'Create' }).click()
      await expect(page.locator('[data-testid="grid-file"][title="test-folder"]')).toBeVisible()
      // reload to ensure clean state after folder creation
      await page.reload()
      await selectViewMode(page, 'grid')
    }

    await expect(page.getByTestId('grid-file').first()).toBeVisible()

    const currentUrl = page.url()

    await focusGrid(page)

    // navigate to find a folder
    let foundFolder = false
    for (let i = 0; i < 20; i++) {
      const focusedItem = page.locator('.grid-file.focused')
      if (await focusedItem.count() > 0) {
        const dataType = await focusedItem.getAttribute('data-type')
        if (dataType === 'directory') {
          foundFolder = true
          break
        }
      }
      await page.keyboard.press('ArrowRight')
    }

    if (!foundFolder) {
      throw new Error('Could not find a folder via keyboard navigation')
    }

    await page.keyboard.press('Enter')

    // wait for navigation
    await page.waitForFunction(
      (url) => window.location.href !== url,
      currentUrl
    )

    expect(page.url()).not.toBe(currentUrl)
  })
})

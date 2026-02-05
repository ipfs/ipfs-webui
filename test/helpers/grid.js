const webuiPort = 3001
const webuiUrl = `http://127.0.0.1:${webuiPort}`
const waitForIpfsStats = globalThis.waitForIpfsStats || (async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
})

/**
 * Select view mode (grid or list)
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} mode - The view mode to select ('grid' or 'list')
 */
const selectViewMode = async (page, mode) => {
  // wait for files view to be ready (either mode) using testids
  await page.waitForSelector('[data-testid="files-grid"], [data-testid="files-list"]', { timeout: 30000 })

  // check current view mode
  const isGridView = await page.getByTestId('files-grid').isVisible()
  const isListView = await page.getByTestId('files-list').isVisible()

  // if already in the desired mode, return early
  if ((mode === 'grid' && isGridView) || (mode === 'list' && isListView)) {
    return
  }

  // click the toggle button - title depends on current state
  if (mode === 'grid') {
    await page.locator('button[title="Click to switch to grid view"]').click()
    await page.waitForSelector('[data-testid="files-grid"]')
  } else {
    await page.locator('button[title="Click to switch to list view"]').click()
    await page.waitForSelector('[data-testid="files-list"]')
  }
}

/**
 * Navigate to the Files page
 * @param {import('@playwright/test').Page} page - The Playwright page object
 */
const navigateToFilesPage = async (page) => {
  await page.goto(webuiUrl + '#/files')

  // Clear localStorage after page has loaded to ensure consistent test state
  await page.evaluate(() => {
    try {
      localStorage.removeItem('files.viewMode')
      localStorage.removeItem('files.sorting')
      localStorage.removeItem('files.showSearch')
    } catch (e) {
      // Ignore if localStorage is not available
    }
  })

  await waitForIpfsStats()
  await page.waitForSelector('[data-testid="files-grid"], [data-testid="files-list"]', { timeout: 60000 })
}

/**
 * Add test files to the current directory
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} directoryName - The name of the directory to add files to
 * @param {number} numFiles - Number of files to add
 */
const addTestFiles = async (page, directoryName, numFiles = 5) => {
  await navigateToFilesPage(page)

  // Navigate to the directory if not already there
  const currentBreadcrumb = await page.locator('.joyride-files-breadcrumbs').textContent()
  if (!currentBreadcrumb.includes(directoryName)) {
    // Find and click the directory in the path
    await page.locator(`.joyride-files-breadcrumbs:has-text("${directoryName}")`).click()
  }

  // Create test file content
  const testFiles = []
  for (let i = 0; i < numFiles; i++) {
    testFiles.push({
      name: `test-file-${i}.txt`,
      content: `Test file content ${i}`
    })
  }

  await page.locator('button[id="import-button"]').click()
  await page.locator('button#add-file').click()

  await page.setInputFiles('input[type="file"]',
    await Promise.all(testFiles.map(async file => {
      // Create a temporary file for each test file
      await page.evaluate(fileData => {
        const blob = new Blob([fileData.content], { type: 'text/plain' })
        return URL.createObjectURL(blob)
      }, file)
      return { name: file.name, mimeType: 'text/plain', buffer: Buffer.from(file.content) }
    }))
  )

  await page.waitForSelector('[title*="test-file-"]')
}

/**
 * Toggle search filter visibility
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {boolean} show - Whether to show (true) or hide (false) the search filter
 */
const toggleSearchFilter = async (page, show) => {
  const searchInput = page.locator('input[aria-label="Filter by name or CID…"]')
  const isVisible = await searchInput.isVisible().catch(() => false)

  if (show && !isVisible) {
    await page.getByRole('button', { name: 'Click to show search filter' }).click()
    await searchInput.waitFor({ state: 'visible', timeout: 5000 })
  } else if (!show && isVisible) {
    await page.getByRole('button', { name: 'Click to show search filter' }).click()
    await searchInput.waitFor({ state: 'hidden', timeout: 5000 })
  }
}

export {
  navigateToFilesPage,
  addTestFiles,
  selectViewMode,
  toggleSearchFilter
}

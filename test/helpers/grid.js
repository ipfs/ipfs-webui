const webuiPort = 3001
const webuiUrl = `http://localhost:${webuiPort}`
const waitForIpfsStats = globalThis.waitForIpfsStats || (async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
})

/**
 * Select view mode (grid or list)
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} mode - The view mode to select ('grid' or 'list')
 */
const selectViewMode = async (page, mode) => {
  // Check current view mode by looking for the presence of grid or list elements
  const isGridView = await page.locator('.files-grid').isVisible().catch(() => false)
  const isListView = await page.locator('.FilesList').isVisible().catch(() => false)

  // If already in the desired mode, return early
  if ((mode === 'grid' && isGridView) || (mode === 'list' && isListView)) {
    return
  }

  // Click the toggle button - title depends on current state
  if (mode === 'grid') {
    // If we want grid and we're in list, click the button with grid title
    await page.locator('button[title="Click to switch to grid view"]').click()
    await page.waitForSelector('.files-grid')
  } else {
    // If we want list and we're in grid, click the button with list title
    await page.locator('button[title="Click to switch to list view"]').click()
    await page.waitForSelector('.FilesList')
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
    } catch (e) {
      // Ignore if localStorage is not available
    }
  })

  await waitForIpfsStats()
  await page.waitForSelector('.files-grid, .FilesList', { timeout: 60000 })
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

  await page.locator('button[aria-label="Import"], button:has-text("Import")').click()

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

export {
  navigateToFilesPage,
  addTestFiles,
  selectViewMode
}

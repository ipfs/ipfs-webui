// Import globals from global scope
const webuiUrl = globalThis.webuiUrl || 'http://localhost:3000'
const waitForIpfsStats = globalThis.waitForIpfsStats || (async () => {
  console.log('Using fallback waitForIpfsStats')
  // Wait a bit to simulate API check
  await new Promise(resolve => setTimeout(resolve, 1000))
})

/**
 * Select view mode (grid or list)
 * @param {import('@playwright/test').Page} page - The Playwright page object
 * @param {string} mode - The view mode to select ('grid' or 'list')
 */
const selectViewMode = async (page, mode) => {
  if (mode === 'grid') {
    await page.locator('button[title="Show items in grid"]').click()
    await page.waitForSelector('.files-grid')
  } else {
    await page.locator('button[title="Show items in list"]').click()
    await page.waitForSelector('.FilesList')
  }
}

/**
 * Navigate to the Files page
 * @param {import('@playwright/test').Page} page - The Playwright page object
 */
const navigateToFilesPage = async (page) => {
  await page.goto(webuiUrl + '#/files')
  await waitForIpfsStats()
  await page.waitForSelector('.files-grid, .FilesList')
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

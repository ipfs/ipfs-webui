/* global webuiUrl, ipfs, page, describe, it, expect, beforeAll */

const fs = require('fs')

describe('Files screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/files')
  })

  const button = 'button[id="add-button"]'

  it('should have the active Add menu', async () => {
    await page.waitForSelector(button, { visible: true })
    await page.click(button)
    await page.waitForSelector('#add-file', { visible: true })
    await expect(page).toMatch('File')
    await expect(page).toMatch('Folder')
    await expect(page).toMatch('From IPFS')
    await expect(page).toMatch('New folder')
    await page.click(button)
  })

  it('should allow for a successful import of a single file', async () => {
    await page.waitForSelector(button, { visible: true })
    await page.click(button)
    await page.waitForSelector('#add-file', { visible: true })

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('a[id="add-file"]') // menu button that triggers file selection
    ])

    // lets add a static text file from the root of this repo
    const filename = 'LICENSE' // TODO: replace with fixtures/file.txt
    await fileChooser.accept([filename])

    // expect file with matching filename to be added to the file list
    await page.waitForSelector('.File')
    await expect(page).toMatch(filename)

    // add file manually to get expected CID (with default params)
    const expectedData = fs.readFileSync(filename, 'utf8')
    const [result] = await ipfs.add(expectedData)

    // expect CID to be present on the page
    await expect(page).toMatch(result.hash)
  })
})

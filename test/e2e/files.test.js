/* global webuiUrl, ipfs, page, describe, it, expect, beforeAll */

const { fixtureData } = require('./fixtures')

describe('Files screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/files')
  })

  const button = 'button[id="import-button"]'

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

  it('should allow for a successful import of two files', async () => {
    await page.waitForSelector(button, { visible: true })
    await page.click(button)
    await page.waitForSelector('#add-file', { visible: true })

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('button[id="add-file"]') // menu button that triggers file selection
    ])

    //  select a single static text file via fileChooser
    const file1 = fixtureData('file.txt')
    const file2 = fixtureData('file2.txt')
    await fileChooser.accept([file1.path, file2.path])

    // expect file with matching filename to be added to the file list
    await page.waitForSelector('.File')
    await expect(page).toMatch('file.txt')
    await expect(page).toMatch('file2.txt')

    // expect valid CID to be present on the page
    const [result1, result2] = await ipfs.add([file1.data, file2.data])
    await expect(page).toMatch(result1.hash)
    await expect(page).toMatch(result2.hash)
  })
})

/* global webuiUrl, ipfs, page, describe, it, beforeAll */

const { fixtureData } = require('./fixtures')
const all = require('it-all')
const filesize = require('filesize')

describe('Files screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/files', { waitUntil: 'networkidle' })
  })

  const button = 'button[id="import-button"]'

  it('should have the active Add menu', async () => {
    await page.waitForSelector(button, { state: 'visible' })
    await page.click(button, { force: true })
    await page.waitForSelector('#add-file', { state: 'visible' })
    await page.waitForSelector('text=File')
    await page.waitForSelector('text=Folder')
    await page.waitForSelector('text=From IPFS')
    await page.waitForSelector('text=New folder')
    await page.click(button, { force: true })
  })

  it('should allow for a successful import of two files', async () => {
    await page.waitForSelector(button, { state: 'visible' })
    await page.click(button)
    await page.waitForSelector('#add-file', { state: 'visible' })

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('button[id="add-file"]') // menu button that triggers file selection
    ])

    //  select a single static text file via fileChooser
    const file1 = fixtureData('file.txt')
    const file2 = fixtureData('file2.txt')
    await fileChooser.setFiles([file1.path, file2.path])

    // expect file with matching filename to be added to the file list
    await page.waitForSelector('.File')
    await page.waitForSelector('text=file.txt')
    await page.waitForSelector('text=file2.txt')

    // expect valid CID to be present on the page
    const [result1, result2] = await all(ipfs.addAll([file1.data, file2.data]))
    await page.waitForSelector(`text=${result1.cid.toString()}`)
    await page.waitForSelector(`text=${result2.cid.toString()}`)

    // expect human readable sizes in format from ./src/lib/files.js#humanSize
    // → this ensures metadata was correctly read for each item in the MFS
    const human = (b) => (b ? filesize(b, {
      standard: 'iec',
      base: 2,
      round: b >= 1073741824 ? 1 : 0
    }) : '-')
    for await (const file of ipfs.files.ls('/')) {
      // the text matcher used by waitFor is particular about whitespace. When the file size is rendered, it uses a `&nbsp;` element, which translates to unicode character 0xa0.
      // If we try to match a plain space, it will fail, so we replace space with `\u00a0` here.
      const expected = `text=${human(file.size).replace(' ', '\u00a0')}`
      await page.waitForSelector(expected)
    }
  })
})

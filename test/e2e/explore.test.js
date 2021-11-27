/* global webuiUrl, ipfs, page, describe, it, expect, beforeAll */

const fs = require('fs')

describe('Explore screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/explore', { waitUntil: 'networkidle' })
  })

  it('should have Project Apollo Archive as one of examples', async () => {
    await page.waitForSelector('a[href="#/explore/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D"]')
    await page.waitForSelector('text=Project Apollo Archives')
    await page.waitForSelector('text=QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')
  })

  it('should open arbitrary CID', async () => {
    // add a local file to repo so test is fast and works in offline mode
    const cid = 'bafkreicgkmwhdunxgdqwqveecdo3wqmgulb4azm6sfnrtvd7g47mnrixji'
    const expectedData = fs.readFileSync('LICENSE', 'utf8')
    const result = await ipfs.add(expectedData, { cidVersion: 1 })
    await expect(result.cid.toString()).toStrictEqual(cid)

    // open inspector
    await page.goto(webuiUrl + `#/explore/${cid}`, { waitUntil: 'networkidle' })
    await page.waitForSelector(`a[href="#/explore/${cid}"]`)
    // expect node type
    await page.waitForSelector('text=Raw Block')
    // expect cid details
    await page.waitForSelector('text=base32 - cidv1 - raw - sha2-256~256~46532C71D1B730E168548410DDBB4186A2C3C0659E915B19D47F373EC6C5174A')
  })
})

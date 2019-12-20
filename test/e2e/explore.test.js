/* global webuiUrl, ipfs, page, describe, it, expect, beforeAll */

const fs = require('fs')

describe('Explore screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/explore')
    await waitForTitle('Explore - IPLD')
  })

  it('should have Project Apollo Archive as one of examples', async () => {
    await page.waitForSelector('a[href="#/explore/QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D"]')
    await expect(page).toMatch('Project Apollo Archive')
    await expect(page).toMatch('QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D')
  })

  it('should open arbitrary CID', async () => {
    // add a local file to repo so test is fast and works in offline mode
    const cid = 'bafkreicgkmwhdunxgdqwqveecdo3wqmgulb4azm6sfnrtvd7g47mnrixji'
    const expectedData = fs.readFileSync('LICENSE', 'utf8')
    const [result] = await ipfs.add(expectedData, { cidVersion: 1 })
    await expect(result.hash).toStrictEqual(cid)

    // open inspector
    await page.goto(webuiUrl + `#/explore/${cid}`)
    // expect node type
    await expect(page).toMatch('DAG Node')
    // expect cid details
    await expect(page).toMatch('base32 - cidv1 - raw - sha2-256-256-46532c71d1b730e168548410ddbb4186a2c3c0659e915b19d47f373ec6c5174a')
  })
})

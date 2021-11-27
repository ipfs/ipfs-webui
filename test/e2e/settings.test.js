/* global webuiUrl, ipfs, page, describe, it, beforeAll */

describe('Settings screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
  })

  it('should show config of IPFS node', async () => {
    await page.waitForSelector('text=Addresses')
    await page.waitForSelector('text=Bootstrap')
    await page.waitForSelector('text=PeerID')
    // check PeerID in config to confirm it comes from expected instance
    const { id } = await ipfs.id()
    await page.waitForSelector(`text=${id}`)
  })
})

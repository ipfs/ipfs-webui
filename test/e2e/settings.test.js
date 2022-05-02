/* global webuiUrl, ipfs, page, describe, it, beforeAll, waitForText */

describe('Settings screen', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl + '#/settings', { waitUntil: 'networkidle' })
  })

  it('should show config of IPFS node', async () => {
    await waitForText('Addresses')
    await waitForText('Bootstrap')
    await waitForText('PeerID')
    // check PeerID in config to confirm it comes from expected instance
    const { id } = await ipfs.id()
    await waitForText(id)
  })
})

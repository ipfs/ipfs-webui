/* global webuiUrl, ipfs, page, describe, it, expect, beforeAll */

describe('Status page', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl, { waitUntil: 'networkidle0' })
  })

  it('should have Status menu item', async () => {
    // this is just a basic smoke-test to tell if page loads at all
    await expect(page).toMatch('Status')
  })

  it('should inform it is sucessfully connected to IPFS', async () => {
    // confirm webui thinks it is connected to node
    await expect(page).toMatch('Connected to IPFS')
  })

  it('should display Peer ID of real IPFS node', async () => {
    // confirm webui is actually connected to expected node :^)
    const { id } = await ipfs.id()
    await expect(page).toMatch(id)
  })
})

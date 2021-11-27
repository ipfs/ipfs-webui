/* global webuiUrl, ipfs, page, describe, it, beforeAll */

describe('Status page', () => {
  beforeAll(async () => {
    await page.goto(webuiUrl, { waitUntil: 'networkidle' })
  })

  it('should have Status menu item', async () => {
    // this is just a basic smoke-test to tell if page loads at all
    await page.waitForSelector('text=Status')
  })

  it('should inform it is sucessfully connected to IPFS', async () => {
    // confirm webui thinks it is connected to node
    await page.waitForSelector('text=Connected to IPFS')
  })

  it('should display Peer ID of real IPFS node', async () => {
    // confirm webui is actually connected to expected node :^)
    const { id } = await ipfs.id()
    await page.waitForSelector(`text=${id}`)
  })
})

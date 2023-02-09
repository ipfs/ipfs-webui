import { test } from './setup/coverage.js'

test.describe('Status page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/')
  })

  test('should have Status menu item', async ({ page }) => {
    // this is just a basic smoke-test to tell if page loads at all
    await page.waitForSelector('text=Status')
  })

  test('should inform it is sucessfully connected to IPFS', async ({ page }) => {
    // confirm webui thinks it is connected to node
    await page.waitForSelector('text=Connected to IPFS')
  })

  test('should display Peer ID of real IPFS node', async ({ page }) => {
    // confirm webui is actually connected to expected node :^)
    const id = process.env.IPFS_RPC_ID
    await page.waitForSelector(`text=${id}`)
  })

  test('should display Agent Version segments matching IPFS node', async ({ page }) => {
    // confirm webui is actually connected to expected node :^)
    for (const segment of process.env.IPFS_RPC_VERSION.split('/')) {
      if (segment.trim()) {
        await page.waitForSelector(`text=${segment}`)
      }
    }
  })
})

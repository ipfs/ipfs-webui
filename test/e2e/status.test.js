import { test, expect } from './setup/coverage.js'

test.describe('Status page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/')
  })

  test('should have Status menu item', async ({ page }) => {
    // basic smoke-test to tell if page loads at all
    await expect(page.getByText('Status')).toBeVisible()
  })

  test('should inform it is successfully connected to IPFS', async ({ page }) => {
    // confirm webui thinks it is connected to node
    await expect(page.getByText('Connected to IPFS')).toBeVisible()
  })

  test('should display Peer ID of real IPFS node', async ({ page }) => {
    // confirm webui is actually connected to expected node
    const id = process.env.IPFS_RPC_ID
    await expect(page.getByText(id).first()).toBeVisible()
  })

  test('should display Agent Version segments matching IPFS node', async ({ page }) => {
    // confirm webui is actually connected to expected node
    for (const segment of process.env.IPFS_RPC_VERSION.split('/')) {
      if (segment.trim()) {
        await expect(page.getByText(segment).first()).toBeVisible()
      }
    }
  })
})

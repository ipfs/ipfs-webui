import { test, expect } from './setup/coverage.js'
import { explore } from './setup/locators.js'

// Inlined CIDs that work without network retrieval (identity multihash)
const INLINED_HELLO_WORLD_CID = 'bafkqac3imvwgy3zao5xxe3de' // "hello world"

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

  test.describe('CID/path input bar', () => {
    test('Browse button navigates to file content', async ({ page }) => {
      // wait for the explore form to be visible
      await expect(explore.cidInput(page)).toBeVisible()

      // enter the inlined "hello world" CID
      await explore.cidInput(page).fill(INLINED_HELLO_WORLD_CID)
      await explore.browseButton(page).click()

      // should display the file content "hello world"
      await expect(page.getByText('hello world')).toBeVisible()

      // URL should contain the CID
      await expect(page).toHaveURL(new RegExp(INLINED_HELLO_WORLD_CID))
    })

    test('Inspect button opens DAG Explorer', async ({ page }) => {
      // wait for the explore form to be visible
      await expect(explore.cidInput(page)).toBeVisible()

      // enter the inlined "hello world" CID
      await explore.cidInput(page).fill(INLINED_HELLO_WORLD_CID)
      await explore.inspectButton(page).click()

      // should display "Raw Block" in DAG Explorer
      await expect(page.getByText('Raw Block')).toBeVisible()

      // URL should contain explore and the CID
      await expect(page).toHaveURL(new RegExp(`explore.*${INLINED_HELLO_WORLD_CID}`))
    })

  })
})

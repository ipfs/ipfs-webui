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
      await expect(explore.browseButton(page)).toBeEnabled()
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
      await expect(explore.inspectButton(page)).toBeEnabled()
      await explore.inspectButton(page).click()

      // should display "Raw Block" in DAG Explorer
      await expect(page.getByText('Raw Block')).toBeVisible()

      // URL should contain explore and the CID
      await expect(page).toHaveURL(new RegExp(`explore.*${INLINED_HELLO_WORLD_CID}`))
    })

    test('invalid CID shows validation error', async ({ page }) => {
      // CID validation happens client-side, so invalid CIDs are caught
      // immediately and show red outline without needing daemon interaction
      await expect(explore.cidInput(page)).toBeVisible()

      // enter an invalid CID path
      await explore.cidInput(page).fill('/ipfs/invalid-cid')

      // input should have error styling (red border via focus-outline-red class)
      await expect(explore.cidInput(page)).toHaveClass(/focus-outline-red/)

      // buttons should be disabled
      await expect(explore.browseButton(page)).toBeDisabled()
      await expect(explore.inspectButton(page)).toBeDisabled()
    })

    test('invalid IPNS name shows error state', async ({ page }) => {
      // IPNS names need to be resolved by the daemon (DNSLink lookup),
      // so validation happens server-side and shows interstitial error page
      await expect(explore.cidInput(page)).toBeVisible()

      // enter an IPNS path that will fail DNSLink resolution
      await explore.cidInput(page).fill('/ipns/invalid-dnslink.example.com')
      await expect(explore.browseButton(page)).toBeEnabled()
      await explore.browseButton(page).click()

      // wait for navigation to the IPNS path
      await expect(page).toHaveURL(/invalid-dnslink/, { timeout: 10000 })

      // should show error page with "Unable to load this path" heading
      await expect(page.getByRole('heading', { name: 'Unable to load this path' })).toBeVisible({ timeout: 30000 })
    })

    test('ipfs:// protocol URL is accepted and normalized', async ({ page }) => {
      // protocol URLs should be auto-converted to paths
      await expect(explore.cidInput(page)).toBeVisible()

      // enter ipfs:// URL format
      await explore.cidInput(page).fill(`ipfs://${INLINED_HELLO_WORLD_CID}`)

      // should be valid (no red outline, buttons enabled)
      await expect(explore.cidInput(page)).not.toHaveClass(/focus-outline-red/)
      await expect(explore.browseButton(page)).toBeEnabled()
      await expect(explore.inspectButton(page)).toBeEnabled()

      // clicking Browse should navigate to the content
      await explore.browseButton(page).click()
      await expect(page.getByText('hello world')).toBeVisible()
    })

    test('ipns:// protocol URL is accepted and normalized', async ({ page }) => {
      // protocol URLs should be auto-converted to paths
      await expect(explore.cidInput(page)).toBeVisible()

      // enter ipns:// URL format (will fail resolution but should be accepted as valid input)
      await explore.cidInput(page).fill('ipns://example.com')

      // should be valid input format (no red outline, buttons enabled)
      await expect(explore.cidInput(page)).not.toHaveClass(/focus-outline-red/)
      await expect(explore.browseButton(page)).toBeEnabled()
      await expect(explore.inspectButton(page)).toBeEnabled()
    })
  })
})

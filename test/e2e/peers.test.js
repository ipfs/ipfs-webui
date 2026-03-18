import { test, expect } from './setup/coverage.js'
import { peers } from './setup/locators.js'
import { create } from 'kubo-rpc-client'

test.describe('Peers screen', () => {
  // Use worker-scoped peerNode fixture from fixtures.js
  // The fixture spawns an ephemeral node once per worker and auto-cleans up

  test.beforeEach(async ({ page, peerAddr }) => {
    // connect ipfs-backend used by webui to this new peer to have something in the peer table
    const webuiIpfs = create(process.env.IPFS_RPC_ADDR)
    await webuiIpfs.swarm.connect(peerAddr)

    await page.goto('/#/peers')
  })

  test('should have a clickable "Add connection" button', async ({ page }) => {
    await expect(peers.addConnectionButton(page)).toBeVisible()
  })

  test('should confirm connection after "Add connection"', async ({ page, peerAddr }) => {
    const addButton = peers.addConnectionButton(page)
    await expect(addButton).toBeVisible()
    await addButton.click()

    // Wait for the modal to appear
    await expect(peers.modal(page)).toBeVisible()

    await expect(page.getByText('Insert the peer address you want to connect to')).toBeVisible()

    // enter multiaddr of a disposable local node spawned for this test
    await peers.multiAddrInput(page).fill(peerAddr)

    // hit Enter
    await page.keyboard.press('Enter')

    // expect connection confirmation
    await expect(peers.successIndicator(page)).toBeVisible()
    await expect(page.getByText('Successfully connected to the provided peer')).toBeVisible()
  })

  test('should have a peer from a "Local Network"', async ({ page }) => {
    await expect(peers.localNetwork(page).first()).toBeVisible()
  })

  test('pressing / focuses the filter input', async ({ page }) => {
    await expect(peers.filterInput(page)).toBeVisible()
    await expect(peers.filterInput(page)).not.toBeFocused()

    await page.keyboard.press('/')
    await expect(peers.filterInput(page)).toBeFocused()
  })

  test('pressing Escape clears the filter input', async ({ page }) => {
    const filterInput = peers.filterInput(page)
    await expect(filterInput).toBeVisible()

    // type a filter term
    await filterInput.fill('nonexistent-peer-xyz')
    await expect(filterInput).toHaveValue('nonexistent-peer-xyz')

    // press Escape to clear
    await filterInput.press('Escape')
    await expect(filterInput).toHaveValue('')
  })
})

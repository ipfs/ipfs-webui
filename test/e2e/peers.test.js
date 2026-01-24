import { test } from './setup/coverage.js'
import { createNode } from 'ipfsd-ctl'
import { create } from 'kubo-rpc-client'
import { path as kuboPath } from 'kubo'

const addConnection = 'text=Add connection'

test.describe('Peers screen', () => {
  let ipfsd
  let peeraddr
  test.beforeAll(async () => {
    // spawn an ephemeral local node for manual swarm connect test
    ipfsd = await createNode({
      type: 'kubo',
      bin: process.env.IPFS_GO_EXEC || kuboPath(),
      rpc: create,
      test: true,
      disposable: true
    })
    const { addresses } = await ipfsd.api.id()
    peeraddr = addresses.find((ma) => ma.toString().startsWith('/ip4/127.0.0.1')).toString()

    // connect ipfs-backend used by webui to this new peer to have something  in the peer table
    const webuiIpfs = create(process.env.IPFS_RPC_ADDR)
    await webuiIpfs.swarm.connect(peeraddr)
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/peers')
  })

  test('should have a clickable "Add connection" button', async ({ page }) => {
    await page.locator(addConnection).waitFor()
  })

  test('should confirm connection after "Add connection" ', async ({ page }) => {
    await page.locator(addConnection).waitFor()
    await page.locator(addConnection).click()

    // Wait for the modal to appear
    await page.locator('[data-testid="ipfs-modal"]').waitFor()

    await page.locator('text=Insert the peer address you want to connect to').waitFor()
    // enter multiaddr of a disposable local node spawned for this test
    await page.locator('input[name="maddr"]').fill(peeraddr)
    // hit Enter
    await page.keyboard.press('Enter')
    // expect connection confirmation
    await page.locator('.bg-green').waitFor({ state: 'visible' })
    await page.locator('text=Successfully connected to the provided peer').waitFor()
  })

  test('should have a peer from a "Local Network"', async ({ page }) => {
    await page.locator('text=Local Network').first().waitFor()
  })

  test.afterAll(async () => {
    if (ipfsd) await ipfsd.stop()
  })
})

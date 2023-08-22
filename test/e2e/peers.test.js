import { test } from './setup/coverage.js'
import { createController } from 'ipfsd-ctl'
import * as kuboRpcModule from 'kubo-rpc-client'
import { path as getGoIpfsPath } from 'kubo'

const addConnection = 'text=Add connection'

test.describe('Peers screen', () => {
  let ipfsd
  let peeraddr
  test.beforeAll(async () => {
    // spawn an ephemeral local node for manual swarm connect test
    ipfsd = await createController({
      type: 'go',
      ipfsBin: getGoIpfsPath(),
      kuboRpcModule,
      test: true,
      disposable: true
    })
    const { addresses } = await ipfsd.api.id()
    peeraddr = addresses.find((ma) => ma.toString().startsWith('/ip4/127.0.0.1')).toString()

    // connect ipfs-backend used by webui to this new peer to have something  in the peer table
    const webuiIpfs = kuboRpcModule.create(process.env.IPFS_RPC_ADDR)
    await webuiIpfs.swarm.connect(peeraddr)
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/#/peers')
  })

  test('should have a clickable "Add connection" button', async ({ page }) => {
    await page.waitForSelector(addConnection)
  })

  test('should confirm connection after "Add connection" ', async ({ page }) => {
    await page.waitForSelector(addConnection)
    await page.click(addConnection)
    await page.waitForSelector('div[role="dialog"]')
    await page.waitForSelector('text=Insert the peer address you want to connect to')
    // enter multiaddr of a disposable local node spawned for this test
    await page.type('div[role="dialog"] input[type="text"]', peeraddr)
    // hit Enter
    await page.keyboard.press('Enter')
    // expect connection confirmation
    await page.waitForSelector('.bg-green', { visible: true })
    await page.waitForSelector('text=Successfully connected to the provided peer')
  })

  test('should have a peer from a "Local Network"', async ({ page }) => {
    await page.waitForSelector('text=Local Network')
  })

  test.afterAll(async () => {
    if (ipfsd) await ipfsd.stop()
  })
})

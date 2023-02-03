/**
 * @see: https://github.com/ipfs/ipfs-webui/issues/2033
 *
 * Enable WebTransport by
 * 1. adding "/ip4/0.0.0.0/udp/4002/quic/webtransport" to Addresses.Swarm
 * 2. enabling transport via ipfs config Swarm.Transports.Network.WebTransport --json true
 *
 * Run the tests with
 *    KUBO_PORT_2033_TEST=5001 npm run test:unit -- --runTestsByPath "test/kubo-webtransport.test.js" --env=./custom-jest-env.js
 */
import { jest } from '@jest/globals'
// import kuboRpcClient from 'kubo-rpc-client'
// import * as ipfsdCtl from 'ipfsd-ctl'
import * as goIpfs from 'go-ipfs'
// const goIpfsBin = goIpfs.path()
// console.log('ipfsdCtl: ', ipfsdCtl)
// const { createController } = ipfsdCtl
// console.log('createController: ', createController)

describe('identity.js', function () {
  describe('Kubo webtransport fix test', function () {
    let ipfs
    let ipfsd
    beforeAll(async () => {
      jest.setTimeout(60 * 1000)
      const ipfsdCtl = (await import('ipfsd-ctl'))
      console.log('typeof ipfsdCtl: ', typeof ipfsdCtl)
      const createController = ipfsdCtl.createController
      const kuboRpcClient = await import('kubo-rpc-client')
      /**
       * This test allows for a manual run of the Kubo daemon to reproduce and
       * prove a fix for https://github.com/ipfs/ipfs-webui/issues/2033
       */
      const KUBO_PORT = process.env.KUBO_PORT_2033_TEST
      if (KUBO_PORT == null) {
        ipfsd = await createController({
          type: 'go',
          ipfsBin: await goIpfs.path(),
          kuboRpcClient,
          test: true,
          disposable: true
        })
        ipfs = ipfsd.api
      } else {
        ipfs = kuboRpcClient(`http://localhost:${KUBO_PORT}`)
      }
    })

    afterAll(async () => {
      if (ipfsd != null) {
        await ipfsd.stop()
      }
    })

    it('should get the id', async function () {
      console.log('should get the id: ')
      expect(async () => await ipfs.id()).not.toThrow()
      expect((await ipfs.id()).id).toEqual(expect.any(String))
    })
  })
})

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
import ipfsHttpModule from 'ipfs-http-client'
import { createController } from 'ipfsd-ctl'

describe('identity.js', function () {
  describe('Kubo webtransport fix test', function () {
    let ipfs
    let ipfsd
    beforeAll(async () => {
      /**
       * This test allows for a manual run of the Kubo daemon to reproduce and
       * prove a fix for https://github.com/ipfs/ipfs-webui/issues/2033
       */
      const KUBO_PORT = process.env.KUBO_PORT_2033_TEST
      if (KUBO_PORT == null) {
        ipfsd = await createController({
          type: 'go',
          ipfsBin: (await import('go-ipfs')).default.path(),
          ipfsHttpModule,
          test: true,
          disposable: true
        })
        ipfs = ipfsd.api
      } else {
        ipfs = ipfsHttpModule(`http://localhost:${KUBO_PORT}`)
      }
    })

    afterAll(async () => {
      if (ipfsd != null) {
        await ipfsd.stop()
      }
    })

    it('should get the id', async function () {
      expect(async () => await ipfs.id()).not.toThrow()
      expect((await ipfs.id()).id).toEqual(expect.any(String))
    })
  })
})

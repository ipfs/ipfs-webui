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
describe.skip('identity.js', function () {
  /**
   * Temporarily skipping due to problems with dependency mismatches between kubo-rpc-client and ipfsd-ctl
   * Current error:
     SyntaxError: The requested module 'uint8arrays/to-string' does not provide an export named 'toString'

      17 |       // console.log('kuboRpcModule: ', kuboRpcModule)
      18 |       const ipfsHttpModule = await import('ipfs-http-client')
    > 19 |       const { createController } = await import('ipfsd-ctl')
         |                                    ^
      20 |       const ipfsBin = (await import('kubo')).default.path()
      21 |       console.log('ipfsBin: ', ipfsBin)
      22 |       /**

      at Runtime.linkAndEvaluateModule (node_modules/jest-cli/node_modules/jest-runtime/build/index.js:779:5)
      at src/bundles/identity.test.js:19:36
   */
  describe('Kubo webtransport fix test', function () {
    let ipfs
    let ipfsd
    beforeAll(async () => {
      // const kuboRpcModule = await import('kubo-rpc-client')
      // console.log('kuboRpcModule: ', kuboRpcModule)
      const kuboRpcModule = await import('kubo-rpc-client')
      const { createController } = await import('ipfsd-ctl')
      const ipfsBin = (await import('kubo')).default.path()
      console.log('ipfsBin: ', ipfsBin)
      /**
       * This test allows for a manual run of the Kubo daemon to reproduce and
       * prove a fix for https://github.com/ipfs/ipfs-webui/issues/2033
       */
      const KUBO_PORT = process.env.KUBO_PORT_2033_TEST
      if (KUBO_PORT == null) {
        ipfsd = await createController({
          type: 'go',
          ipfsBin,
          kuboRpcModule,
          test: true,
          disposable: true
        })
        ipfs = ipfsd.api
      } else {
        ipfs = kuboRpcModule(`http://localhost:${KUBO_PORT}`)
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
}, 10000)

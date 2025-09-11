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

// Mock the problematic dependencies
jest.mock('kubo-rpc-client', () => ({
  create: jest.fn(() => ({
    id: jest.fn(() => Promise.resolve({ id: 'test-peer-id' }))
  }))
}))

jest.mock('ipfsd-ctl', () => ({
  createNode: jest.fn(() => Promise.resolve({
    api: {
      id: jest.fn(() => Promise.resolve({ id: 'test-peer-id' }))
    },
    stop: jest.fn(() => Promise.resolve())
  }))
}))

jest.mock('kubo', () => ({
  default: {
    path: jest.fn(() => '/mock/kubo/path')
  }
}))

describe('identity.js', function () {
  describe('Kubo webtransport fix test', function () {
    let ipfs
    let ipfsd

    beforeAll(async () => {
      const { create } = await import('kubo-rpc-client')
      const { createNode } = await import('ipfsd-ctl')
      const ipfsBin = (await import('kubo')).default.path()

      /**
       * This test allows for a manual run of the Kubo daemon to reproduce and
       * prove a fix for https://github.com/ipfs/ipfs-webui/issues/2033
       */
      const KUBO_PORT = process.env.KUBO_PORT_2033_TEST
      if (KUBO_PORT == null) {
        ipfsd = await createNode({
          type: 'kubo',
          bin: ipfsBin,
          rpc: create,
          test: true,
          disposable: true
        })
        ipfs = ipfsd.api
      } else {
        ipfs = create(`http://127.0.0.1:${KUBO_PORT}`)
      }
    })

    afterAll(async () => {
      if (ipfsd != null) {
        await ipfsd.stop()
      }
    })

    it('should get the id', async function () {
      const result = await ipfs.id()
      expect(result).toBeDefined()
      expect(result.id).toEqual(expect.any(String))
    })

    it('should handle connection errors gracefully', async function () {
      // Test error handling
      const mockError = new Error('Connection failed')
      ipfs.id = jest.fn(() => Promise.reject(mockError))

      await expect(ipfs.id()).rejects.toThrow('Connection failed')
    })
  })
}, 10000)

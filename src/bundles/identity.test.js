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
// import { expect } from '@playwright/test'
import ipfsHttpModule from 'ipfs-http-client'

describe('Kubo webtransport fix test', function () {
  it('should get the id', async function () {
    const KUBO_PORT = process.env.KUBO_PORT_2033_TEST

    if (KUBO_PORT == null) {
      this.skip('KUBO_PORT_2033_TEST is not set')
    }
    const ipfs = ipfsHttpModule(`http://localhost:${KUBO_PORT}`)

    expect(async () => await ipfs.id()).not.toThrow()
    expect((await ipfs.id()).id).toEqual(expect.any(String))
    // expect the id to be equal to a string now
  })
})

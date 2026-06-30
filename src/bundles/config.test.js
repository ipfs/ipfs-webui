/* global describe, it, expect, beforeEach, afterEach */
import { jest } from '@jest/globals'
import { composeBundles } from 'redux-bundler'
import configBundle from './config.js'
import gatewayBundle from './gateway.js'

// selectIpfsReady is false so the reactConfigFetch reactor stays quiet and we
// drive doFetchConfig (which runs getPromise) deterministically from the test.
const createMockIpfsBundle = (config) => ({
  name: 'ipfs',
  getExtraArgs: () => ({ getIpfs: () => ({ config: { getAll: async () => config } }) }),
  selectIpfsReady: () => false,
  selectIpfsConnected: () => false
})

const createStore = (config) => composeBundles(
  createMockIpfsBundle(config),
  gatewayBundle,
  configBundle
)()

describe('gateway selection with a Local Gateway URL override', () => {
  // getURLFromAddress logs when @multiformats/multiaddr-to-uri cannot resolve a
  // multiaddr, which it cannot under jest; the override path does not need it.
  let logSpy
  beforeEach(() => {
    window.localStorage.clear()
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => logSpy.mockRestore())

  // https://github.com/ipfs/ipfs-webui/issues/2458
  it('routes the configured and available gateway through the override, and falls back to the Kubo config gateway when cleared', async () => {
    const store = createStore({ Addresses: { Gateway: '/ip4/127.0.0.1/tcp/8080' } })

    // trailing slash is normalized away on save
    await store.doUpdateLocalGateway('https://ipfs.example.com/')
    await store.doFetchConfig()

    expect(store.selectLocalGateway()).toBe('https://ipfs.example.com')
    // override beats the Kubo config gateway for download links
    expect(store.selectGatewayUrl()).toBe('https://ipfs.example.com')
    // getPromise sets availableGateway to the override, so previews, thumbnails
    // and IPNS links (which use selectAvailableGateway*) honor it too
    expect(store.selectAvailableGateway()).toBe('https://ipfs.example.com')
    expect(store.selectAvailableGatewayUrl()).toBe('https://ipfs.example.com')

    // clearing the override removes it from gateway selection (the multiaddr
    // ->URI fallback to the Kubo config gateway is covered by e2e, since
    // @multiformats/multiaddr-to-uri does not load under jest)
    await store.doUpdateLocalGateway('')
    expect(store.selectLocalGateway()).toBe('')
  })
})

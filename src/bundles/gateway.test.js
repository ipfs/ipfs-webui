/* global describe, it, expect, beforeEach */
import { composeBundles } from 'redux-bundler'
import gatewayBundle, { localGatewayToKuboGateway, checkValidHttpUrl, DEFAULT_KUBO_GATEWAY, DEFAULT_PATH_GATEWAY, DEFAULT_SUBDOMAIN_GATEWAY } from './gateway.js'
import configBundle from './config.js'
import { readSetting } from './local-storage.js'
import { SHARE_LINK_TYPE, DEFAULT_SHARE_LINK_TYPE } from '../lib/share-link.js'

describe('localGatewayToKuboGateway', () => {
  it('keeps an explicit port and treats http as insecure', () => {
    expect(localGatewayToKuboGateway('http://127.0.0.1:8080')).toEqual({
      host: '127.0.0.1',
      port: '8080',
      protocol: 'http',
      trustlessBlockBrokerConfig: { init: { allowLocal: true, allowInsecure: true } }
    })
  })

  it('defaults the port to 443 for https and keeps it secure', () => {
    expect(localGatewayToKuboGateway('https://ipfs.example.com')).toEqual({
      host: 'ipfs.example.com',
      port: '443',
      protocol: 'https',
      trustlessBlockBrokerConfig: { init: { allowLocal: true, allowInsecure: false } }
    })
  })

  it('defaults the port to 80 for http without an explicit port', () => {
    expect(localGatewayToKuboGateway('http://gateway.local').port).toBe('80')
  })

  it('throws on an invalid URL', () => {
    expect(() => localGatewayToKuboGateway('not a url')).toThrow()
  })
})

describe('checkValidHttpUrl', () => {
  it('accepts http and https URLs, including non-default ports', () => {
    expect(checkValidHttpUrl('http://127.0.0.1:8080')).toBe(true)
    expect(checkValidHttpUrl('https://ipfs.example.com')).toBe(true)
  })

  it('rejects non-http(s) and malformed values', () => {
    expect(checkValidHttpUrl('ftp://example.com')).toBe(false)
    expect(checkValidHttpUrl('not a url')).toBe(false)
    expect(checkValidHttpUrl('')).toBe(false)
  })
})

const createMockIpfsBundle = (config) => ({
  name: 'ipfs',
  getExtraArgs: () => ({ getIpfs: () => ({ config: { getAll: async () => config } }) }),
  selectIpfsReady: () => false,
  selectIpfsConnected: () => false
})

const createStore = () => composeBundles(
  createMockIpfsBundle({ Addresses: { Gateway: '/ip4/127.0.0.1/tcp/8080' } }),
  gatewayBundle,
  configBundle
)()

describe('gateway bundle actions', () => {
  beforeEach(() => window.localStorage.clear())

  it('reverts the share link type to native when its public path gateway is cleared', async () => {
    const store = createStore()
    await store.doUpdatePublicGateway('https://path-gw.example.com')
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.PUBLIC_PATH)
    expect(store.selectShareLinkType()).toBe(SHARE_LINK_TYPE.PUBLIC_PATH)
    await store.doUpdatePublicGateway('')
    expect(store.selectShareLinkType()).toBe(SHARE_LINK_TYPE.NATIVE)
  })

  it('does not revert when clearing a public gateway the type does not point at', async () => {
    const store = createStore()
    await store.doUpdatePublicSubdomainGateway('https://subdomain-gw.example.net')
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
    await store.doUpdatePublicGateway('') // clears the PATH gateway; type is SUBDOMAIN
    expect(store.selectShareLinkType()).toBe(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
  })

  it('does not revert when saving a non-empty public gateway', async () => {
    const store = createStore()
    await store.doUpdatePublicGateway('https://a.example.com')
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.PUBLIC_PATH)
    await store.doUpdatePublicGateway('https://b.example.com')
    expect(store.selectShareLinkType()).toBe(SHARE_LINK_TYPE.PUBLIC_PATH)
  })

  it('doUpdateLocalGateway refreshes availableGateway, syncs kuboGateway, and flags the explorer reload', async () => {
    const store = createStore()
    await store.doUpdateLocalGateway('http://127.0.0.1:9999')
    expect(store.selectExplorerNeedsReload()).toBe(true)
    expect(store.selectAvailableGateway()).toBe('http://127.0.0.1:9999')
    expect(readSetting('kuboGateway')).toEqual(localGatewayToKuboGateway('http://127.0.0.1:9999'))

    await store.doUpdateLocalGateway('')
    expect(readSetting('kuboGateway')).toEqual(DEFAULT_KUBO_GATEWAY)
  })

  it('normalizes a trailing slash on the stored local gateway', async () => {
    const store = createStore()
    await store.doUpdateLocalGateway('http://127.0.0.1:9999/')
    expect(store.selectLocalGateway()).toBe('http://127.0.0.1:9999')
  })

  it('doUpdateLocalGateway is a no-op when the value is unchanged', async () => {
    const store = createStore()
    // Initial value is '': re-submitting it must not write settings or
    // schedule an Explore reload.
    await store.doUpdateLocalGateway('')
    expect(store.selectExplorerNeedsReload()).toBe(false)
    expect(readSetting('kuboGateway')).toBeFalsy()
  })

  it('selectEffectiveShareLinkType falls back to native for a local type with no local gateway', async () => {
    const store = createStore()
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.LOCAL_PATH)
    // The test store never fetches the Kubo config, so there is no local
    // gateway at all until the override is set.
    expect(store.selectEffectiveShareLinkType()).toBe(SHARE_LINK_TYPE.NATIVE)
    await store.doUpdateLocalGateway('http://127.0.0.1:9999')
    expect(store.selectEffectiveShareLinkType()).toBe(SHARE_LINK_TYPE.LOCAL_PATH)
  })

  it('selectEffectiveShareLinkType stays native while the chosen public gateway is cleared', async () => {
    const store = createStore()
    await store.doUpdatePublicSubdomainGateway('')
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
    expect(store.selectEffectiveShareLinkType()).toBe(SHARE_LINK_TYPE.NATIVE)
    await store.doUpdatePublicSubdomainGateway('https://subdomain-gw.example.net')
    expect(store.selectEffectiveShareLinkType()).toBe(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
  })
})

describe('shipped defaults', () => {
  beforeEach(() => window.localStorage.clear())

  it('a fresh node has the public gateways prefilled and shares through the subdomain one', () => {
    const store = createStore()
    expect(store.selectPublicGateway()).toBe(DEFAULT_PATH_GATEWAY)
    expect(store.selectPublicSubdomainGateway()).toBe(DEFAULT_SUBDOMAIN_GATEWAY)
    expect(store.selectShareLinkType()).toBe(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
    expect(store.selectEffectiveShareLinkType()).toBe(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
  })

  it('a cleared public gateway stays cleared after a reload instead of reverting to the default', async () => {
    await createStore().doUpdatePublicGateway('')
    expect(createStore().selectPublicGateway()).toBe('')
  })

  it('selecting a public type persists the prefilled default gateway it points at', async () => {
    const store = createStore()
    expect(readSetting('ipfsPublicSubdomainGateway')).toBe(null)
    expect(readSetting('ipfsPublicGateway')).toBe(null)
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)
    expect(readSetting('ipfsPublicSubdomainGateway')).toBe(DEFAULT_SUBDOMAIN_GATEWAY)
    await store.doUpdateShareLinkType(SHARE_LINK_TYPE.PUBLIC_PATH)
    expect(readSetting('ipfsPublicGateway')).toBe(DEFAULT_PATH_GATEWAY)
  })
})

describe('readShareLinkTypeSetting (via bundle init)', () => {
  beforeEach(() => window.localStorage.clear())

  it('falls back to the default for a corrupted stored value', () => {
    window.localStorage.setItem('ipfsShareLinkType', JSON.stringify('bogus'))
    expect(createStore().selectShareLinkType()).toBe(DEFAULT_SHARE_LINK_TYPE)
  })

  it('preserves a valid stored value', () => {
    window.localStorage.setItem('ipfsShareLinkType', JSON.stringify(SHARE_LINK_TYPE.LOCAL_PATH))
    expect(createStore().selectShareLinkType()).toBe(SHARE_LINK_TYPE.LOCAL_PATH)
  })
})

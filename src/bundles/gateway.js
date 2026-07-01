import { createSelector } from 'redux-bundler'
import { readSetting, writeSetting } from './local-storage.js'
import { SHARE_LINK_TYPE, DEFAULT_SHARE_LINK_TYPE, resolveEffectiveShareLinkType } from '../lib/share-link.js'

export const DEFAULT_IPFS_CHECK_URL = 'https://check.ipfs.network'
// Test gateway URLs used by e2e tests
export const TEST_PATH_GATEWAY = 'https://e2e-test-path-gateway.test'
export const TEST_SUBDOMAIN_GATEWAY = 'https://e2e-test-subdomain-gateway.test'

// Public gateways start empty until the user opts in, so a fresh node shares
// native ipfs:// links rather than routing through a third-party gateway.
const readPublicGatewaySetting = () => {
  const setting = readSetting('ipfsPublicGateway')
  return typeof setting === 'string' ? setting : ''
}

const readLocalGatewaySetting = () => {
  const setting = readSetting('ipfsLocalGateway')
  // Return empty string if not set, so we can distinguish between
  // "not configured" and "configured to empty"
  return setting || ''
}

const readPublicSubdomainGatewaySetting = () => {
  const setting = readSetting('ipfsPublicSubdomainGateway')
  return typeof setting === 'string' ? setting : ''
}

const readIpfsCheckUrlSetting = () => {
  const setting = readSetting('ipfsCheckUrl')
  return setting || DEFAULT_IPFS_CHECK_URL
}

const readShareLinkTypeSetting = () => {
  const setting = readSetting('ipfsShareLinkType')
  return typeof setting === 'string' && Object.values(SHARE_LINK_TYPE).includes(setting)
    ? setting
    : DEFAULT_SHARE_LINK_TYPE
}

const init = () => ({
  availableGateway: null,
  publicGateway: readPublicGatewaySetting(),
  publicSubdomainGateway: readPublicSubdomainGatewaySetting(),
  ipfsCheckUrl: readIpfsCheckUrlSetting(),
  localGateway: readLocalGatewaySetting(),
  shareLinkType: readShareLinkTypeSetting(),
  // Not persisted: set when the local gateway changes so the Explore page
  // reloads its Helia node (which reads kuboGateway only at startup) the next
  // time it is opened. A page reload resets this back to false.
  explorerNeedsReload: false
})

/**
 * @param {any} value
 * @returns {boolean}
 */
export const checkValidHttpUrl = (value) => {
  let url

  try {
    url = new URL(value)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

/**
 * Default `kuboGateway` config consumed by Helia/verified-fetch
 * (ipld-explorer-components) on the Explore page when no explicit Local Gateway
 * URL is set.
 */
export const DEFAULT_KUBO_GATEWAY = { trustlessBlockBrokerConfig: { init: { allowLocal: true, allowInsecure: false } } }

/**
 * Convert a Local Gateway URL into the `kuboGateway` config shape consumed by
 * Helia/verified-fetch on the Explore page, so the explorer fetches blocks from
 * the same gateway the rest of the WebUI uses.
 * @param {string} gatewayUrl
 * @returns {{host: string, port: string, protocol: string, trustlessBlockBrokerConfig: object}}
 */
export const localGatewayToKuboGateway = (gatewayUrl) => {
  const url = new URL(gatewayUrl)
  const protocol = url.protocol.replace(':', '')
  return {
    host: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    protocol,
    trustlessBlockBrokerConfig: { init: { allowLocal: true, allowInsecure: protocol === 'http' } }
  }
}

const bundle = {
  name: 'gateway',

  /**
   * @param {any} state
   * @param {any} action
   * @returns {any}
   */
  reducer: (state = init(), action) => {
    if (action.type === 'SET_AVAILABLE_GATEWAY') {
      return { ...state, availableGateway: action.payload }
    }

    if (action.type === 'SET_PUBLIC_GATEWAY') {
      return { ...state, publicGateway: action.payload }
    }

    if (action.type === 'SET_PUBLIC_SUBDOMAIN_GATEWAY') {
      return { ...state, publicSubdomainGateway: action.payload }
    }

    if (action.type === 'SET_IPFS_CHECK_URL') {
      return { ...state, ipfsCheckUrl: action.payload }
    }

    if (action.type === 'SET_LOCAL_GATEWAY') {
      return { ...state, localGateway: action.payload }
    }

    if (action.type === 'SET_SHARE_LINK_TYPE') {
      return { ...state, shareLinkType: action.payload }
    }

    if (action.type === 'SET_EXPLORER_NEEDS_RELOAD') {
      return { ...state, explorerNeedsReload: action.payload }
    }

    return state
  },

  /**
   * @param {string} url
   * @returns {function({dispatch: Function}): any}
   */
  doSetAvailableGateway: url => ({ dispatch }) => dispatch({ type: 'SET_AVAILABLE_GATEWAY', payload: url }),

  /**
   * @param {string} address
   * @returns {function({dispatch: Function, store: any}): Promise<void>}
   */
  doUpdatePublicGateway: (address) => async ({ dispatch, store }) => {
    await writeSetting('ipfsPublicGateway', address)
    dispatch({ type: 'SET_PUBLIC_GATEWAY', payload: address })
    // Clearing the gateway that the Share Link type points at reverts the choice
    // to native, so the selected option matches what is actually configured.
    if (!address && store.selectShareLinkType() === SHARE_LINK_TYPE.PUBLIC_PATH) {
      await store.doUpdateShareLinkType(SHARE_LINK_TYPE.NATIVE)
    }
  },

  /**
   * @param {string} address
   * @returns {function({dispatch: Function, store: any}): Promise<void>}
   */
  doUpdatePublicSubdomainGateway: (address) => async ({ dispatch, store }) => {
    await writeSetting('ipfsPublicSubdomainGateway', address)
    dispatch({ type: 'SET_PUBLIC_SUBDOMAIN_GATEWAY', payload: address })
    if (!address && store.selectShareLinkType() === SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN) {
      await store.doUpdateShareLinkType(SHARE_LINK_TYPE.NATIVE)
    }
  },

  /**
   * @param {string} url
   * @returns {function({dispatch: Function}): Promise<void>}
   */
  doUpdateIpfsCheckUrl: (url) => async ({ dispatch }) => {
    await writeSetting('ipfsCheckUrl', url)
    dispatch({ type: 'SET_IPFS_CHECK_URL', payload: url })
  },

  /**
   * @param {string} address
   * @returns {function({dispatch: Function, store: any}): Promise<void>}
   */
  doUpdateLocalGateway: (address) => async ({ dispatch, store }) => {
    // Normalize: remove trailing slashes
    const normalizedAddress = address.replace(/\/+$/, '')
    await writeSetting('ipfsLocalGateway', normalizedAddress)
    dispatch({ type: 'SET_LOCAL_GATEWAY', payload: normalizedAddress })

    // Refresh availableGateway now (the override when set, the Kubo config
    // gateway when cleared) so previews, thumbnails, IPNS links and the Explore
    // link switch immediately, instead of waiting for the config bundle to go
    // stale.
    store.doSetAvailableGateway(store.selectGatewayUrl())

    // Keep kuboGateway (used by Helia/Explore) in sync with the override.
    if (normalizedAddress) {
      try {
        await writeSetting('kuboGateway', localGatewayToKuboGateway(normalizedAddress))
      } catch (e) {
        console.error('Error syncing ipfsLocalGateway to kuboGateway:', e)
      }
    } else {
      // Override cleared: restore defaults so Explore stops using the old host.
      await writeSetting('kuboGateway', DEFAULT_KUBO_GATEWAY)
    }

    // The Explore page's Helia node reads kuboGateway only when it boots, so it
    // cannot pick up the change in place. Flag it to reload the next time the
    // user opens Explore; that reload clears this (non-persisted) flag.
    dispatch({ type: 'SET_EXPLORER_NEEDS_RELOAD', payload: true })
  },

  /**
   * @param {any} state
   * @returns {string|null}
   */
  selectAvailableGateway: (state) => state?.gateway?.availableGateway,

  /**
   * @param {any} state
   * @returns {string}
   */
  selectPublicGateway: (state) => state?.gateway?.publicGateway,

  /**
   * @param {any} state
   * @returns {string}
   */
  selectPublicSubdomainGateway: (state) => state?.gateway?.publicSubdomainGateway,

  /**
   * @param {any} state
   * @returns {string}
   */
  selectIpfsCheckUrl: (state) => state?.gateway?.ipfsCheckUrl,

  /**
   * @param {any} state
   * @returns {string}
   */
  selectLocalGateway: (state) => state?.gateway?.localGateway,

  /**
   * Whether the Explore page should reload to re-init its Helia node after a
   * local gateway change. See ExploreContainer.
   * @param {any} state
   * @returns {boolean}
   */
  selectExplorerNeedsReload: (state) => state?.gateway?.explorerNeedsReload,

  /**
   * @param {string} type - a SHARE_LINK_TYPE value
   * @returns {function({dispatch: Function}): Promise<void>}
   */
  doUpdateShareLinkType: (type) => async ({ dispatch }) => {
    await writeSetting('ipfsShareLinkType', type)
    dispatch({ type: 'SET_SHARE_LINK_TYPE', payload: type })
  },

  /**
   * The link type the user selected for Share Link and Publish to IPNS.
   * @param {any} state
   * @returns {string}
   */
  selectShareLinkType: (state) => state?.gateway?.shareLinkType,

  // The link type actually used: a public type falls back to native when its
  // public gateway is empty, so the two consumers (Share Link, Publish to IPNS)
  // stay consistent with the disabled-option logic in Settings.
  selectEffectiveShareLinkType: createSelector(
    'selectShareLinkType',
    'selectPublicGateway',
    'selectPublicSubdomainGateway',
    (shareLinkType, publicGateway, publicSubdomainGateway) =>
      resolveEffectiveShareLinkType(shareLinkType, { publicGateway, publicSubdomainGateway })
  )
}

export default bundle

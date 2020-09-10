// @ts-check

import multiaddr from 'multiaddr'
import HttpClient from 'ipfs-http-client'
import { getIpfs, providers } from 'ipfs-provider'
import last from 'it-last'

/**
 * @typedef {'httpClient'|'jsIpfs'|'windowIpfs'|'webExt'} ProviderName
 * @typedef {Object} Model
 * @property {void|string} apiAddress
 * @property {void|ProviderName} provider
 * @property {boolean} failed
 * @property {boolean} ready
 * @property {boolean} invalidAddress
 *
 * @typedef {Object} InitStarted
 * @property {'IPFS_INIT_STARTED'} type
 *
 * @typedef {Object} InitFinished
 * @property {'IPFS_INIT_FINISHED'} type
 * @property {Object} payload
 * @property {ProviderName} payload.provider
 * @property {IPFSAPI} payload.ipfs
 * @property {string} [payload.apiAddress]
 *
 * @typedef {Object} InitFailed
 * @property {'IPFS_INIT_FAILED'} type
 *
 * @typedef {Object} Stopped
 * @property {'IPFS_STOPPED'} type
 *
 * @typedef {Object} AddressUpdated
 * @property {'IPFS_API_ADDRESS_UPDATED'} type
 * @property {string} payload
 *
 * @typedef {Object} AddressInvalid
 * @property {'IPFS_API_ADDRESS_INVALID'} type
 *
 * @typedef {Object} Dismiss
 * @property {'IPFS_API_ADDRESS_INVALID_DISMISS'} type
 * @typedef {InitStarted|InitFinished|InitFailed|Stopped|AddressUpdated|AddressInvalid|Dismiss} Message
 */

/**
 * @param {Model} state
 * @param {Message} message
 * @returns {Model}
 */
const update = (state, message) => {
  switch (message.type) {
    case 'IPFS_INIT_STARTED': {
      return { ...state, ready: false }
    }
    case 'IPFS_INIT_FINISHED': {
      ipfs = message.payload.ipfs
      return {
        ...state,
        ready: true,
        failed: false,
        provider: message.payload.provider,
        apiAddress: asAPIOptions(message.payload.apiAddress || state.apiAddress)
      }
    }
    case 'IPFS_STOPPED': {
      return { ...state, ready: false, failed: false }
    }
    case 'IPFS_INIT_FAILED': {
      return { ...state, ready: false, failed: true }
    }
    case 'IPFS_API_ADDRESS_UPDATED': {
      return { ...state, apiAddress: message.payload, invalidAddress: false }
    }
    case 'IPFS_API_ADDRESS_INVALID': {
      return { ...state, invalidAddress: true }
    }
    case 'IPFS_API_ADDRESS_INVALID_DISMISS': {
      return { ...state, invalidAddress: true }
    }
    default: {
      return state
    }
  }
}

/**
 * @returns {Model}
 */
const init = () => {
  return {
    apiAddress: readAPIAddressSetting(),
    provider: null,
    failed: false,
    ready: false,
    invalidAddress: false
  }
}

/**
 * @returns {string|null}
 */
const readAPIAddressSetting = () => {
  const setting = readSetting('ipfsApi')
  return setting == null ? null : asAPIOptions(setting)
}

/**
 * @returns {object|string|null}
 */
const asAPIOptions = (value) => asHttpClientOptions(value) || asMultiaddress(value) || asURL(value)

/**
 * Attempts to turn cast given value into URL.
 * Return either string instance or `null`.
 * @param {any} value
 * @returns {string|null}
 */
const asURL = (value) => {
  try {
    return new URL(value).toString()
  } catch (_) {
    return null
  }
}

/**
 * Attempts to turn cast given value into Multiaddr.
 * Return either string instance or `null`.
 * @param {any} value
 * @returns {string|null}
 */
const asMultiaddress = (value) => {
  // ignore empty string, as it will produce '/'
  if (value != null && value !== '') {
    try {
      return multiaddr(value).toString()
    } catch (_) {}
  }
  return null
}

/**
 * Attempts to turn cast given value into options object compatible with ipfs-http-client constructor.
 * Return either string with JSON or `null`.
 * @param {any} value
 * @returns {object|null}
 */
const asHttpClientOptions = (value) => {
  try {
    value = JSON.parse(value)
  } catch (_) {}

  // turn URL with inlined basic auth into client options object
  try {
    const uri = new URL(value)
    const { username, password } = uri
    if (username && password) {
      value = {
        host: uri.hostname,
        port: uri.port || (uri.protocol === 'https:' ? '443' : '80'),
        protocol: uri.protocol.split(':').shift(),
        apiPath: (uri.pathname !== '/' ? uri.pathname : 'api/v0'),
        headers: {
          authorization: `Basic ${btoa(username + ':' + password)}`
        }
      }
    }
  } catch (_) { }

  // https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client#importing-the-module-and-usage
  if (value && (value.host || value.apiPath || value.protocol || value.port || value.headers)) {
    return value
  }
  return null
}

/**
 * Reads setting from the `localStorage` with a given `id` as JSON. If JSON
 * parse is failed setting is interpreted as a string value.
 * @param {string} id
 * @returns {string|object|null}
 */
const readSetting = (id) => {
  let setting = null
  if (window.localStorage) {
    try {
      setting = window.localStorage.getItem(id)
    } catch (error) {
      console.error(`Error reading '${id}' value from localStorage`, error)
    }

    try {
      return JSON.parse(setting)
    } catch (_) {
      // res was probably a string, so pass it on.
      return setting
    }
  }
}

const writeSetting = (id, value) => {
  try {
    window.localStorage.setItem(id, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing '${id}' value to localStorage`, error)
  }
}

/**
 * @typedef {Object} IPFSAPI
 * @property {(callback?:Function) => Promise<void>} stop
 */

/** @type {IPFSAPI|void} */
let ipfs = null

/**
 * @typedef {Object} State
 * @property {Model} ipfs
 */

const bundle = {
  name: 'ipfs',
  reducer: (state, message) => update(state == null ? init() : state, message),
  getExtraArgs () {
    return { getIpfs: () => ipfs }
  },
  /**
   * @param {State} state
   */
  selectIpfsReady: state => state.ipfs.ready,
  /**
   * @param {State} state
   */
  selectIpfsProvider: state => state.ipfs.provider,
  /**
   * @param {State} state
   */
  selectIpfsApiAddress: state => state.ipfs.apiAddress,
  /**
   * @param {State} state
   */
  selectIpfsInvalidAddress: state => state.ipfs.invalidAddress,
  /**
   * @param {State} state
   */
  selectIpfsInitFailed: state => state.ipfs.failed,

  doInitIpfs: () => async (store) => {
    await initIPFS(store)
  },

  doStopIpfs: () => async (store) => {
    if (ipfs) {
      ipfs.stop(() => {
        store.dispatch({ type: 'IPFS_STOPPED' })
      })
    }
  },

  doUpdateIpfsApiAddress: (address) => async (store) => {
    const apiAddress = asAPIOptions(address)
    if (apiAddress == null) {
      store.dispatch({ type: 'IPFS_API_ADDRESS_INVALID' })
    } else {
      await writeSetting('ipfsApi', apiAddress)
      store.dispatch({ type: 'IPFS_API_ADDRESS_UPDATED', payload: apiAddress })

      await initIPFS(store)
    }
  },

  doDismissIpfsInvalidAddress: () => (store) => {
    store.dispatch({ type: 'IPFS_API_ADDRESS_INVALID_DISMISS' })
  }
}

const initIPFS = async (store) => {
  store.dispatch({ type: 'IPFS_INIT_STARTED' })

  /** @type {Model} */
  const { apiAddress } = store.getState().ipfs

  try {
    const result = await getIpfs({
      // @ts-ignore - TS can't seem to infer connectionTest option
      connectionTest: async (ipfs) => {
        // ipfs connection is working if can we fetch the bw stats.
        // See: https://github.com/ipfs-shipyard/ipfs-webui/issues/835#issuecomment-466966884
        try {
          await last(ipfs.stats.bw())
        } catch (err) {
          if (!/bandwidth reporter disabled in config/.test(err)) {
            throw err
          }
        }

        return true
      },
      loadHttpClientModule: () => HttpClient,
      providers: [
        providers.httpClient({ apiAddress })
      ]
    })

    store.dispatch({ type: 'IPFS_INIT_FINISHED', payload: result })
  } catch (error) {
    store.dispatch({ type: 'IPFS_INIT_FAILED' })
  }
}

export default bundle

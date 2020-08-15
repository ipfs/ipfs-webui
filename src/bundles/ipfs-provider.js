import multiaddr from 'multiaddr'
// @ts-ignore
import HttpClient from 'ipfs-http-client'
// @ts-ignore
import { getIpfs, providers } from 'ipfs-provider'
import last from 'it-last'

/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {'httpClient'|'jsIpfs'|'windowIpfs'|'webExt'} ProviderName
 * @typedef {Object} Model
 * @property {null|string} apiAddress
 * @property {null|ProviderName} provider
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
 * @property {IPFSService} payload.ipfs
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
        apiAddress: message.payload.apiAddress || state.apiAddress
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
  return setting == null ? null : asAPIAddress(setting)
}

/**
 * @param {any} value
 * @returns {string|null}
 */
const asAPIAddress = (value) => asMultiaddress(value) || asURL(value)

/**
 * Attempts to turn cast given value into `URL` instance. Return either `URL`
 * instance or `null`.
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
 * Attempts to turn cast given value into `URL` instance. Return either `URL`
 * instance or `null`.
 * @param {any} value
 * @returns {string|null}
 */
const asMultiaddress = (value) => {
  if (value != null) {
    try {
      return multiaddr(value).toString()
    } catch (_) {}
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
  /** @type {string|null} */
  let setting = null
  if (window.localStorage) {
    try {
      setting = window.localStorage.getItem(id)
    } catch (error) {
      console.error(`Error reading '${id}' value from localStorage`, error)
    }

    try {
      return JSON.parse(setting || '')
    } catch (_) {
      // res was probably a string, so pass it on.
      return setting
    }
  }

  return setting
}

/**
 * @param {string} id
 * @param {string|number|boolean|object} value
 */
const writeSetting = (id, value) => {
  try {
    window.localStorage.setItem(id, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing '${id}' value to localStorage`, error)
  }
}

/** @type {IPFSService|null} */
let ipfs = null

/**
 * @typedef {typeof extra} Extra
 */
const extra = {
  getIpfs () {
    return ipfs
  }
}

/**
 * @typedef {import('redux-bundler').Selectors<typeof selectors>} Selectors
 */

const selectors = {
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
  selectIpfsInitFailed: state => state.ipfs.failed
}

/**
 * @typedef {import('redux-bundler').Actions<typeof actions>} Actions
 * @typedef {import('redux-bundler').Context<State, Message, {}, Extra>} Context
 */

const actions = {
  /**
   * @returns {function(Context):Promise<void>}
   */
  doInitIpfs: () => async (context) => {
    await initIPFS(context)
  },
  /**
   * @returns {function(Context):Promise<void>}
   */
  doStopIpfs: () => async (context) => {
    if (ipfs) {
      await ipfs.stop()
      context.dispatch({ type: 'IPFS_STOPPED' })
    }
  },

  /**
   * @param {*} address
   * @returns {function(Context):Promise<void>}
   */
  doUpdateIpfsApiAddress: (address) => async (context) => {
    const apiAddress = asAPIAddress(address)
    if (apiAddress == null) {
      context.dispatch({ type: 'IPFS_API_ADDRESS_INVALID' })
    } else {
      await writeSetting('ipfsApi', apiAddress)
      context.dispatch({ type: 'IPFS_API_ADDRESS_UPDATED', payload: apiAddress })

      await initIPFS(context)
    }
  },

  /**
   * @returns {function(Context):void}
   */
  doDismissIpfsInvalidAddress: () => (context) => {
    context.dispatch({ type: 'IPFS_API_ADDRESS_INVALID_DISMISS' })
  }
}

/**
 * @typedef {Actions & Selectors} IPFSProviderStore
 * @typedef {Object} State
 * @property {Model} ipfs
 */

const bundle = {
  name: 'ipfs',
  /**
   * @param {Model} [state]
   * @param {Message} message
   * @returns {Model}
   */
  reducer: (state, message) => update(state == null ? init() : state, message),
  getExtraArgs () {
    return extra
  },
  ...selectors,
  ...actions
}

/**
 * @param {Context} context
 */
const initIPFS = async (context) => {
  context.dispatch({ type: 'IPFS_INIT_STARTED' })

  const { apiAddress } = context.getState().ipfs

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

    context.dispatch({ type: 'IPFS_INIT_FINISHED', payload: result })
  } catch (error) {
    context.dispatch({ type: 'IPFS_INIT_FAILED' })
  }
}

export default bundle

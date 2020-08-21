import multiaddr from 'multiaddr'
// @ts-ignore
import HttpClient from 'ipfs-http-client'
// @ts-ignore
import { getIpfs, providers } from 'ipfs-provider'
import last from 'it-last'
import * as Enum from './enum'
import { perform } from './util'

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
 * @typedef {import('./util').Perform<'IPFS_INIT', Error, InitResult, void>} Init
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
 *
 * @typedef {Object} InitResult
 * @property {ProviderName} provider
 * @property {IPFSService} ipfs
 * @property {string} [apiAddress]
 * @typedef {Init|Stopped|AddressUpdated|AddressInvalid|Dismiss} Message
 */

export const ACTIONS = Enum.from([
  'IPFS_INIT',
  'IPFS_STOPPED',
  'IPFS_API_ADDRESS_UPDATED',
  'IPFS_API_ADDRESS_INVALID',
  'IPFS_API_ADDRESS_INVALID_DISMISS'
])

/**
 * @param {Model} state
 * @param {Message} message
 * @returns {Model}
 */
const update = (state, message) => {
  switch (message.type) {
    case ACTIONS.IPFS_INIT: {
      const { task } = message
      switch (task.status) {
        case 'Init': {
          return { ...state, ready: false }
        }
        case 'Exit': {
          const { result } = task
          if (result.ok) {
            const { provider, apiAddress, ipfs: service } = result.value
            ipfs = service
            return {
              ...state,
              ready: true,
              failed: false,
              provider,
              apiAddress: apiAddress || state.apiAddress
            }
          } else {
            return {
              ...state,
              ready: false,
              failed: true
            }
          }
        }
        default: {
          return state
        }
      }
    }
    case ACTIONS.IPFS_STOPPED: {
      return { ...state, ready: false, failed: false }
    }
    case ACTIONS.IPFS_API_ADDRESS_UPDATED: {
      return { ...state, apiAddress: message.payload, invalidAddress: false }
    }
    case ACTIONS.IPFS_API_ADDRESS_INVALID: {
      return { ...state, invalidAddress: true }
    }
    case ACTIONS.IPFS_API_ADDRESS_INVALID_DISMISS: {
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
 * @typedef {Selectors & Actions} Ext
 * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} Context
 */

const actions = {
  /**
   * @returns {function(Context):Promise<InitResult>}
   */
  doInitIpfs: () => context => perform(context, 'IPFS_INIT',
  /**
   * @param {Context} context
   * @returns {Promise<InitResult>}
   */
    async (context) => {
      const { apiAddress } = context.getState().ipfs

      return await getIpfs({
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
    }),
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

      await context.store.doInitIpfs()
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

export default bundle

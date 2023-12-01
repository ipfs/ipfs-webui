import { multiaddr } from '@multiformats/multiaddr'
// @ts-ignore
import { getIpfs, providers } from 'ipfs-provider'
import first from 'it-first'
import last from 'it-last'
import * as Enum from './enum.js'
import { perform } from './task.js'
import { readSetting, writeSetting } from './local-storage.js'

/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('ipfs').FileStat} FileStat
 * @typedef {'httpClient'|'jsIpfs'|'windowIpfs'|'webExt'} ProviderName
 * @typedef {Object} Model
 * @property {null|string|HTTPClientOptions} apiAddress
 * @property {null|ProviderName} provider
 * @property {boolean} failed
 * @property {boolean} ready
 * @property {boolean} invalidAddress
 * @property {boolean} pendingFirstConnection
 *
 *
 * @typedef {import('./task').Perform<'IPFS_INIT', Error, InitResult, void>} Init
 * @typedef {Object} Stopped
 * @property {'IPFS_STOPPED'} type
 *
 * @typedef {Object} AddressUpdated
 * @property {'IPFS_API_ADDRESS_UPDATED'} type
 * @property {string|HTTPClientOptions} payload
 *
 * @typedef {Object} AddressInvalid
 * @property {'IPFS_API_ADDRESS_INVALID'} type
 *
 * @typedef {Object} Dismiss
 * @property {'IPFS_API_ADDRESS_INVALID_DISMISS'} type
 *
 * @typedef {Object} ConnectSuccess
 * @property {'IPFS_CONNECT_SUCCEED'} type
 *
 * @typedef {Object} ConnectFail
 * @property {'IPFS_CONNECT_FAILED'} type
 *
 * @typedef {Object} DismissError
 * @property {'NOTIFY_DISMISSED'} type
 *
 * @typedef {Object} PendingFirstConnection
 * @property {'IPFS_API_ADDRESS_PENDING_FIRST_CONNECTION'} type
 * @property {boolean} pending
 *
 * @typedef {Object} InitResult
 * @property {ProviderName} provider
 * @property {IPFSService} ipfs
 * @property {string} [apiAddress]
 * @typedef {Init|Stopped|AddressUpdated|AddressInvalid|Dismiss|PendingFirstConnection|ConnectFail|ConnectSuccess|DismissError} Message
 */

export const ACTIONS = Enum.from([
  'IPFS_INIT',
  'IPFS_STOPPED',
  'IPFS_API_ADDRESS_UPDATED',
  'IPFS_API_ADDRESS_PENDING_FIRST_CONNECTION',
  'IPFS_API_ADDRESS_INVALID',
  'IPFS_API_ADDRESS_INVALID_DISMISS',
  // Notifier actions
  'IPFS_CONNECT_FAILED',
  'IPFS_CONNECT_SUCCEED',
  'NOTIFY_DISMISSED'
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
    case ACTIONS.IPFS_API_ADDRESS_PENDING_FIRST_CONNECTION: {
      const { pending } = message
      return { ...state, pendingFirstConnection: pending }
    }
    case ACTIONS.IPFS_CONNECT_SUCCEED: {
      return { ...state, failed: false }
    }
    case ACTIONS.IPFS_CONNECT_FAILED: {
      return { ...state, failed: true }
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
    invalidAddress: false,
    pendingFirstConnection: false
  }
}

/**
 * @returns {HTTPClientOptions|string|null}
 */
const readAPIAddressSetting = () => {
  const setting = readSetting('ipfsApi')
  return setting == null ? null : asAPIOptions(setting)
}

/**
 * @param {string|object} value
 * @returns {boolean}
 */
export const checkValidAPIAddress = (value) => {
  return asAPIOptions(value) != null
}

/**
 * @param {string|object} value
 * @returns {HTTPClientOptions|string|null}
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
 * @typedef {Object} HTTPClientOptions
 * @property {string} [url]
 * @property {string} [host]
 * @property {string} [port] - (e.g. '443', or '80')
 * @property {string} [protocol] - (e.g 'https', 'http')
 * @property {string} [apiPath] - ('/api/v0' by default)
 * @property {Object<string, string>} [headers]
 */

/**
 * @typedef {Object} IPFSProviderHttpClientOptions
 * @property {Object} [ipld]
 * @property {string|undefined} [url]
 */

/**
 * Attempts to turn parse given input as an options object for kubo-rpc-client.
 * @param {string|object} value
 * @returns {HTTPClientOptions|null}
 */
const asHttpClientOptions = (value) =>
  typeof value === 'string' ? parseHTTPClientOptions(value) : readHTTPClientOptions(value)

/**
 *
 * @param {string} input
 */
const parseHTTPClientOptions = (input) => {
  // Try parsing and reading as json
  try {
    return readHTTPClientOptions(JSON.parse(input))
  } catch (_) {}

  // turn URL with inlined basic auth into client options object
  try {
    const url = new URL(input)
    const { username, password } = url
    if (username && password) {
      url.username = url.password = ''
      return {
        url: url.toString(),
        headers: {
          authorization: `Basic ${btoa(username + ':' + password)}`
        }
      }
    }
  } catch (_) { }

  return null
}

/**
 * @param {Object<string, any>} value
 * @returns {HTTPClientOptions|null}
 */
const readHTTPClientOptions = (value) => {
  // https://github.com/ipfs/js-kubo-rpc-client#importing-the-module-and-usage
  if (value && (!!value.url || value.host || value.apiPath || value.protocol || value.port || value.headers)) {
    return value
  } else {
    return null
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
  selectIpfsInitFailed: state => state.ipfs.failed,
  /**
   * @param {State} state
   */
  selectIpfsPendingFirstConnection: state => state.ipfs.pendingFirstConnection
}

/**
 * @typedef {import('redux-bundler').Actions<typeof actions>} Actions
 * @typedef {Selectors & Actions} Ext
 * @typedef {import('redux-bundler').Context<State, Message, Ext, Extra>} Context
 */

const actions = {
  /**
   * @returns {function(Context):Promise<boolean>}
   */
  doTryInitIpfs: () => async ({ store }) => {
    // There is a code in `bundles/retry-init.js` that reacts to `IPFS_INIT`
    // action and attempts to retry.
    try {
      await store.doInitIpfs()
      return true
    } catch (_) {
      // Catches connection errors like timeouts
      return false
    }
  },
  /**
   * @returns {function(Context):Promise<InitResult>}
   */
  doInitIpfs: () => perform('IPFS_INIT',
    /**
    * @param {Context} context
    * @returns {Promise<InitResult>}
    */
    async (context) => {
      const { apiAddress } = context.getState().ipfs
      /** @type {IPFSProviderHttpClientOptions} */
      let ipfsOptions = {
        /* TODO: restore when  no longer bundle standalone ipld with ipld-explorer
        * context: https://github.com/ipfs/ipld-explorer-components/pull/289
        ipld: {
          formats: [
            ...Object.values(ipldEthereum),
            ipldGit
          ]
        }
        */
      }
      const { create } = await import('kubo-rpc-client')

      if (typeof apiAddress === 'string') {
        ipfsOptions = {
          ...ipfsOptions,
          url: apiAddress
        }
      } else {
        ipfsOptions = {
          ...apiAddress,
          ...ipfsOptions
        }
      }

      const result = await getIpfs({
        /**
         *
         * @param {import('kubo-rpc-client').IPFSHTTPClient} ipfs
         * @returns {Promise<boolean>}
         */
        connectionTest: async (ipfs) => {
          // ipfs connection is working if can we fetch the bw stats.
          // See: https://github.com/ipfs-shipyard/ipfs-webui/issues/835#issuecomment-466966884
          try {
            await last(ipfs.stats.bw())
          } catch (err) {
            const error = /** @type {Error} */(err)
            const errorString = error.toString() || error.message || /** @type {string} */(/** @type {unknown} */(error))
            if (!/bandwidth reporter disabled in config/.test(errorString)) {
              throw err
            }
          }

          return true
        },
        loadHttpClientModule: () => create,
        providers: [
          providers.httpClient(ipfsOptions)
        ]
      })

      if (!result) {
        throw Error(`Could not connect to the IPFS API (${apiAddress})`)
      } else {
        return result
      }
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
   * @param {string} address
   * @returns {function(Context):Promise<boolean>}
   */
  doUpdateIpfsApiAddress: (address) => async (context) => {
    const apiAddress = asAPIOptions(address)
    if (apiAddress == null) {
      context.dispatch({ type: ACTIONS.IPFS_API_ADDRESS_INVALID })
      return false
    } else {
      await writeSetting('ipfsApi', apiAddress)
      context.dispatch({ type: ACTIONS.IPFS_API_ADDRESS_UPDATED, payload: apiAddress })

      // Sends action to indicate we're going to try to update the IPFS API address.
      // There is logic to retry doTryInitIpfs in bundles/retry-init.js, so
      // we're triggering the PENDING_FIRST_CONNECTION action here to avoid blocking
      // the UI while we automatically retry.
      context.dispatch({
        type: ACTIONS.IPFS_API_ADDRESS_PENDING_FIRST_CONNECTION,
        pending: true
      })
      context.dispatch({
        type: ACTIONS.IPFS_STOPPED
      })
      context.dispatch({
        type: ACTIONS.NOTIFY_DISMISSED
      })
      const succeeded = await context.store.doTryInitIpfs()
      if (succeeded) {
        context.dispatch({
          type: ACTIONS.IPFS_CONNECT_SUCCEED
        })
      } else {
        context.dispatch({
          type: ACTIONS.IPFS_CONNECT_FAILED
        })
      }
      context.dispatch({
        type: ACTIONS.IPFS_API_ADDRESS_PENDING_FIRST_CONNECTION,
        pending: false
      })
      return succeeded
    }
  },

  /**
   * @returns {function(Context):void}
   */
  doDismissIpfsInvalidAddress: () => (context) => {
    context.dispatch({ type: 'IPFS_API_ADDRESS_INVALID_DISMISS' })
  },

  /**
   * @param {string} path
   * @returns {function(Context):Promise<FileStat>}
   */
  doGetPathInfo: (path) => async () => {
    if (ipfs) {
      return await ipfs.files.stat(path)
    } else {
      throw Error('IPFS is not initialized')
    }
  },

  /**
   * @param {CID} cid
   * @returns {function(Context):Promise<boolean>}
   */
  doCheckIfPinned: (cid) => async () => {
    if (ipfs == null) {
      return false
    }

    try {
      const value = await first(ipfs.pin.ls({ paths: [cid], type: 'recursive' }))
      return !!value
    } catch (_) { return false }
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
   * @param {Model|void} state
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

import { createSelector } from 'redux-bundler'

/**
 * @typedef {Object} Model
 * @property {number} lastError
 *
 * @typedef {Object} Message
 * @property {'STATS_FETCH_FAILED'} type
 *
 * @typedef {Object} State
 * @property {Model} connected
 *
 * @typedef {import('redux-bundler').Selectors<typeof selectors>} Selectors
 */

const selectors = {
  /**
   * @param {State} state
   */
  selectConnectedLastError: state => state.connected.lastError,

  selectIpfsConnected: createSelector(
    'selectIpfsReady',
    'selectNodeBandwidthLastSuccess',
    'selectNodeBandwidthLastError',
    /**
     * @param {boolean} ipfsReady
     * @param {number|void} lastSuccess
     * @param {number} lastError
     * @returns {boolean}
     */
    (ipfsReady, lastSuccess, lastError) =>
      ipfsReady && lastSuccess != null && lastSuccess > lastError
  )
}

// We ask for the stats every few seconds, so that gives a good indication
// that ipfs things are working (or not), without additional polling of the api.
const connected = {
  name: 'connected',

  /**
   * @param {Model} [state]
   * @param {Message} action
   * @returns {Model}
   */
  reducer: (state = { lastError: 0 }, action) => {
    if (action.type === 'STATS_FETCH_FAILED') {
      return { lastError: Date.now() }
    }
    return state
  },

  ...selectors
}

export default connected

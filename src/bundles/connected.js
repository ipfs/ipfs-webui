import { createSelector } from 'redux-bundler'

/**
 * @typedef {Object} Model
 * @property {number} lastError
 * @property {boolean} isNodeInfoOpen
 *
 * @typedef {FetchFailed|InfoOpen} Message
 *
 * @typedef {Object} FetchFailed
 * @property {'STATS_FETCH_FAILED'} type
 *
 * @typedef {Object} InfoOpen
 * @property {'NODE_INFO_OPEN'} type
 * @property {boolean} payload
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
  ),

  /**
   * @param {State} state
   */
  selectIsNodeInfoOpen: state => state.connected.isNodeInfoOpen
}

/**
 * @typedef {import('redux-bundler').Actions<typeof actions>} Actions
 * @typedef {Selectors & Actions} Ext
 * @typedef {import('redux-bundler').Context<State, Message, Ext>} Context
 */
const actions = {
  /**
   * @param {boolean} value
   * @returns {function(Context): void}
   */
  doSetIsNodeInfoOpen: value => ({ dispatch }) => dispatch({ type: 'NODE_INFO_OPEN', payload: value })
}

// We ask for the stats every few seconds, so that gives a good indication
// that ipfs things are working (or not), without additional polling of the api.
const connected = {
  name: 'connected',

  /**
   * @param {Model|void} state
   * @param {Message} action
   * @returns {Model}
   */
  reducer: (state, action) => {
    state = state || { lastError: 0, isNodeInfoOpen: false }
    switch (action.type) {
      case 'STATS_FETCH_FAILED':
        return { ...state, lastError: Date.now() }
      case 'NODE_INFO_OPEN':
        return { ...state, isNodeInfoOpen: action.payload }
      default:
        return state
    }
  },
  ...actions,
  ...selectors
}

export default connected

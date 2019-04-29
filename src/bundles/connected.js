import { createSelector } from 'redux-bundler'

// We ask for the stats every few seconds, so that gives a good indication
// that ipfs things are working (or not), without additional polling of the api.
const connected = {
  name: 'connected',

  reducer: (state = {}, action) => {
    if (action.type === 'STATS_FETCH_FAILED') {
      return { lastError: Date.now() }
    }
    return state
  },

  selectConnectedLastError: state => state.connected.lastError,

  selectIpfsConnected: createSelector(
    'selectIpfsReady',
    'selectNodeBandwidthLastSuccess',
    'selectNodeBandwidthLastError',
    (ipfsReady, lastSuccess, lastError) => ipfsReady && lastSuccess && lastSuccess > lastError
  )
}

export default connected

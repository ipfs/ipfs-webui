import { createSelector } from 'redux-bundler'

// We ask for the stats every few seconds, so that gives a good indication
// that ipfs things are working (or not), without additional polling of the api.
const connected = {
  name: 'status',
  selectIpfsConnected: createSelector(
    'selectIpfsReady',
    'selectStatsIsWaitingToRetry',
    (ipfsReady, statsError) => ipfsReady && !statsError
  )
}

export default connected

import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'

const bundle = createAsyncResourceBundle({
  name: 'nodeBandwidth',
  actionBaseType: 'NODE_BANDWIDTH',
  getPromise: ({ getIpfs }) => getIpfs().stats.bw(),
  staleAfter: ms.seconds(3),
  retryAfter: ms.seconds(3),
  persist: false,
  checkIfOnline: false
})

bundle.selectNodeBandwidthLastSuccess = state => state.nodeBandwidth.lastSuccess

// Update the node bandwidth if it is stale (appTime - lastSuccess > staleAfter)
bundle.reactNodeBandwidthFetchWhenIdle = createSelector(
  'selectNodeBandwidthShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchNodeBandwidth' }
    }
  }
)

export default bundle

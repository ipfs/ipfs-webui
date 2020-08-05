import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'
import all from 'it-all'

const bundle = createAsyncResourceBundle({
  name: 'nodeBandwidth',
  actionBaseType: 'NODE_BANDWIDTH',
  getPromise: async ({ getIpfs }) => {
    try {
      const stats = await all(getIpfs().stats.bw())
      return stats
    } catch (err) {
      if (/bandwidth reporter disabled in config/.test(err)) {
        return { disabled: true }
      }

      throw err
    }
  },
  staleAfter: ms.seconds(3),
  retryAfter: ms.seconds(3),
  persist: false,
  checkIfOnline: false
})

bundle.selectNodeBandwidthEnabled = state => state.nodeBandwidth.data ? !state.nodeBandwidth.data.disabled : false

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

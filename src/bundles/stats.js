import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'stats',
  getPromise: async ({ getIpfs }) => {
    const [bw] = await Promise.all([
      // getIpfs().stats.bitswap(),
      // getIpfs().stats.repo(),
      getIpfs().stats.bw()
    ])
    return { bw }
  },
  staleAfter: 3000,
  persist: false,
  checkIfOnline: false
})

// Fetch the config if we don't have it or it's more than `staleAfter` ms old
bundle.reactStatsFetch = createSelector(
  'selectStatsShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchStats' }
    }
  }
)

export default bundle

import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'stats',
  getPromise: async ({getIpfs}) => {
    const [bitswap, repo, bw] = await Promise.all([
      getIpfs().stats.bitswap(),
      getIpfs().stats.repo(),
      getIpfs().stats.bw()
    ])
    return { bitswap, repo, bw }
  },
  staleAfter: 2000,
  persist: false,
  checkIfOnline: false
})

bundle.selectWantlistLength = (state) => {
  return (state.stats.bitswap && state.stats.bitswap.wantlist && state.stats.bitswap.wantlist.length) || 0
}

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

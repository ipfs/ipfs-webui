import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'repoStats',
  getPromise: async ({ getIpfs }) => {
    return getIpfs().repo.stat()
  },
  staleAfter: 60000,
  persist: false,
  checkIfOnline: false
})

bundle.selectRepoSize = createSelector(
  'selectRepoStats',
  (repoStats) => {
    if (repoStats && repoStats.repoSize) {
      return repoStats.repoSize.toString()
    }
  }
)

bundle.selectRepoNumObjects = createSelector(
  'selectRepoStats',
  (repoStats) => {
    if (repoStats && repoStats.numObjects) {
      return repoStats.numObjects.toString()
    }
  }
)

// Fetch the config if we don't have it or it's more than `staleAfter` ms old
bundle.reactRepoStatsFetch = createSelector(
  'selectRepoStatsShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchRepoStats' }
    }
  }
)

export default bundle

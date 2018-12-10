import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'repoStats',
  getPromise: async ({ getIpfs }) => {
    const mfsRootStat = await getIpfs().files.stat('/')
    const repoStats = await getIpfs().repo.stat()
    console.log({ ...repoStats, mfsRootStat })
    return { ...repoStats, mfsRootStat }
  },
  staleAfter: 60000,
  persist: false,
  checkIfOnline: false
})

bundle.selectMfsCumulativeSize = createSelector(
  'selectRepoStats',
  (repoStats) => {
    if (repoStats && repoStats.mfsRootStat && repoStats.mfsRootStat.cumulativeSize) {
      return repoStats.mfsRootStat.cumulativeSize
    }
    return null
  }
)

bundle.selectRepoSize = createSelector(
  'selectRepoStats',
  (repoStats) => {
    if (repoStats && repoStats.repoSize) {
      return repoStats.repoSize.toString()
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

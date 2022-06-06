import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'bitswapStats',
  getPromise: async ({ getIpfs }) => {
    const rawData = await getIpfs().stats.bitswap()
    // early gc, dont keep arround the peer list
    return { downloadedSize: rawData.dataReceived, sharedSize: rawData.dataSent }
  },
  staleAfter: 60000,
  persist: false,
  checkIfOnline: false
})

bundle.selectDownloadedSize = createSelector(
  'selectBitswapStats',
  (bitswapStats) => {
    if (bitswapStats && bitswapStats.downloadedSize) {
      return bitswapStats.downloadedSize.toString()
    }
  }
)

bundle.selectSharedSize = createSelector(
  'selectBitswapStats',
  (bitswapStats) => {
    console.log(bitswapStats)
    if (bitswapStats && bitswapStats.sharedSize) {
      return bitswapStats.sharedSize.toString()
    }
  }
)

// Fetch the config if we don't have it or it's more than `staleAfter` ms old
bundle.reactBitswapStatsFetch = createSelector(
  'selectBitswapStatsShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchBitswapStats' }
    }
  }
)

export default bundle

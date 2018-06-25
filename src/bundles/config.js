import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'config',
  getPromise: async ({getIpfs}) => {
    // Uint8Array
    const rawConf = await getIpfs().config.get()
    // stringy json for quick compares
    const conf = rawConf.toString()
    return conf
  },
  staleAfter: 60000,
  checkIfOnline: false
})

// derive the object from the stringy json
bundle.selectConfigObject = createSelector(
  `selectConfig`,
  (configStr) => JSON.parse(configStr)
)

// TODO: this is a work-around for IPFS companion blocking the config API
// see: https://github.com/ipfs-shipyard/ipfs-companion/issues/454
bundle.selectIsConfigBlocked = createSelector(
  `selectConfigRaw`,
  ({errorType}) => errorType === 'Access to config.get API is globally blocked for window.ipfs'
)

// Fetch the config if we don't have it or it's more than `staleAfter` ms old
bundle.reactConfigFetch = createSelector(
  'selectConfigShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchConfig' }
    }
  }
)

export default bundle

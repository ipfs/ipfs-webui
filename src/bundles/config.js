import toUri from 'multiaddr-to-uri'
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

bundle.selectGatewayUrl = createSelector(
  `selectConfigObject`,
  (config) => getURLFromAddress('Gateway', config)
)

bundle.selectApiUrl = createSelector(
  `selectConfigObject`,
  (config) => getURLFromAddress('API', config)
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

function getURLFromAddress (name, config) {
  try {
    const address = config.Addresses[name]
    return toUri(address)
  } catch (error) {
    console.log(`Failed to get url from Addresses.${name}`, error)
    return null
  }
}

export default bundle

import memoize from 'p-memoize'
import toUri from 'multiaddr-to-uri'
import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const DEFAULT_URI = 'https://ipfs.io'
const DEFAULT_MULTI_ADDR = '/dns4/ipfs.io/tcp/443/https'

const bundle = createAsyncResourceBundle({
  name: 'config',
  getPromise: async ({ getIpfs }) => {
    const rawConf = await getIpfs().config.getAll()
    let conf

    if (Buffer.isBuffer(rawConf)) {
      conf = rawConf.toString()
    } else {
      conf = JSON.stringify(rawConf, null, '\t')
    }

    // More info: https://github.com/ipfs-shipyard/ipfs-webui/issues/1490#issuecomment-671633602
    const config = JSON.parse(conf)
    const url = getURLFromAddress('Gateway', config) || DEFAULT_URI

    if (!await checkIfGatewayUrlIsAccessible(url)) {
      config.Addresses.Gateway = DEFAULT_MULTI_ADDR
      return JSON.stringify(config)
    }

    // stringy json for quick compares
    return conf
  },
  staleAfter: 60000,
  persist: false,
  checkIfOnline: false
})

// derive the object from the stringy json
bundle.selectConfigObject = createSelector(
  'selectConfig',
  (configStr) => JSON.parse(configStr)
)

bundle.selectApiUrl = createSelector(
  'selectConfigObject',
  (config) => getURLFromAddress('API', config) || DEFAULT_URI
)

bundle.selectGatewayUrl = createSelector(
  'selectConfigObject',
  (config) => getURLFromAddress('Gateway', config) || DEFAULT_URI
)

bundle.selectBootstrapPeers = createSelector(
  'selectConfigObject',
  (config) => config && config.Bootstrap
)

// TODO: this is a work-around for IPFS companion blocking the config API
// see: https://github.com/ipfs-shipyard/ipfs-companion/issues/454
bundle.selectIsConfigBlocked = createSelector(
  'selectConfigRaw',
  ({ errorType }) => errorType === 'Access to config.get API is globally blocked for window.ipfs'
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
  if (!config) return null

  try {
    const address = Array.isArray(config.Addresses[name])
      ? config.Addresses[name][0]
      : config.Addresses[name]
    return toUri(address).replace('tcp://', 'http://')
  } catch (error) {
    console.log(`Failed to get url from Addresses.${name}`, error)
    return null
  }
}

const checkIfGatewayUrlIsAccessible = memoize(async (url) => {
  try {
    const { status } = await fetch(
    `${url}/ipfs/bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354`
    )
    return status === 200
  } catch (e) {
    console.error(`Unable to use the gateway at ${url}. The public gateway will be used as a fallback`, e)
    return false
  }
})

export default bundle

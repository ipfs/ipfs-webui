import memoize from 'p-memoize'
import { multiaddrToUri as toUri } from '@multiformats/multiaddr-to-uri'
import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const LOCAL_HOSTNAMES = ['127.0.0.1', '[::1]', '0.0.0.0', '[::]']

const bundle = createAsyncResourceBundle({
  name: 'config',
  staleAfter: 60000,
  persist: false,
  checkIfOnline: false,

  getPromise: async ({ getIpfs, store }) => {
    const rawConf = await getIpfs().config.getAll()
    let conf

    if (Buffer.isBuffer(rawConf)) {
      conf = rawConf.toString()
    } else {
      conf = JSON.stringify(rawConf, null, '\t')
    }

    const config = JSON.parse(conf)

    const publicGateway = store.selectPublicGateway()
    const url = getURLFromAddress('Gateway', config) || publicGateway

    // Normalize local hostnames to localhost
    // to leverage subdomain gateway, if present
    // https://github.com/ipfs-shipyard/ipfs-webui/issues/1490
    const gw = new URL(url)
    if (LOCAL_HOSTNAMES.includes(gw.hostname)) {
      gw.hostname = 'localhost'
      const localUrl = gw.toString().replace(/\/+$/, '') // no trailing slashes
      if (await checkIfSubdomainGatewayUrlIsAccessible(localUrl)) {
        store.doSetAvailableGateway(localUrl)
        return conf
      }
    }

    if (!await checkIfGatewayUrlIsAccessible(url)) {
      store.doSetAvailableGateway(publicGateway)
    }

    // stringy json for quick compares
    return conf
  }
})

// derive the object from the stringy json
bundle.selectConfigObject = createSelector(
  'selectConfig',
  (configStr) => JSON.parse(configStr)
)

bundle.selectApiUrl = createSelector(
  'selectConfigObject',
  'selectPublicGateway',
  (config, publicGateway) => getURLFromAddress('API', config) || publicGateway
)

bundle.selectGatewayUrl = createSelector(
  'selectConfigObject',
  'selectPublicGateway',
  (config, publicGateway) => getURLFromAddress('Gateway', config) || publicGateway
)

bundle.selectAvailableGatewayUrl = createSelector(
  'selectAvailableGateway',
  'selectGatewayUrl',
  (availableGateway, gatewayUrl) => availableGateway || gatewayUrl
)

bundle.selectBootstrapPeers = createSelector(
  'selectConfigObject',
  (config) => config && config.Bootstrap
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
    const url = toUri(address, { assumeHttp: true })
    if (new URL(url).port === 0) throw Error('port set to 0, not deterministic')
    return url
  } catch (error) {
    console.log(`Failed to get url from config at Addresses.${name}`, error)
    return null
  }
}

const checkIfGatewayUrlIsAccessible = memoize(async (url) => {
  try {
    const { status } = await fetch(
    `${url}/ipfs/bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss`
    )
    return status === 200
  } catch (e) {
    console.error(`Unable to use the gateway at ${url}. The public gateway will be used as a fallback`, e)
    return false
  }
})

// Separate test is necessary to see if subdomain mode is possible,
// because some browser+OS combinations won't resolve them:
// https://github.com/ipfs/kubo/issues/7527
const checkIfSubdomainGatewayUrlIsAccessible = memoize(async (url) => {
  try {
    url = new URL(url)
    url.hostname = `bafkqae2xmvwgg33nmuqhi3zajfiemuzahiwss.ipfs.${url.hostname}`
    const { status } = await fetch(url.toString())
    return status === 200
  } catch (e) {
    console.error(`Unable to use the subdomain gateway at ${url}. Regular gateway will be used as a fallback`, e)
    return false
  }
})

export default bundle

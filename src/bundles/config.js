import { multiaddrToUri as toUri } from '@multiformats/multiaddr-to-uri'
import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { contextBridge } from '../helpers/context-bridge'

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

    // availableGateway drives previews, thumbnails, IPNS links and the Explore
    // link: the user's Local Gateway URL override, or the gateway from the Kubo
    // config, chosen without any reachability probing. selectAvailableGatewayUrl
    // only falls back to a public gateway (through selectGatewayUrl) when no
    // local gateway is configured at all.
    // https://github.com/ipfs/ipfs-webui/issues/2458
    const gateway = store.selectLocalGateway() || getURLFromAddress('Gateway', config)
    if (gateway) {
      store.doSetAvailableGateway(gateway)
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

bundle.reactIsSameOriginToBridge = createSelector(
  'selectConfigObject',
  'selectPublicGateway',
  (config, publicGateway) => {
    const apiUrl = getURLFromAddress('API', config) || publicGateway
    contextBridge.setContext('selectIsSameOrigin', window.location.origin === apiUrl)
  }
)

bundle.selectGatewayUrl = createSelector(
  'selectConfigObject',
  'selectPublicGateway',
  'selectLocalGateway',
  (config, publicGateway, localGateway) => {
    // Priority: 1) User-configured local gateway, 2) Kubo config, 3) Public gateway
    const url = localGateway || getURLFromAddress('Gateway', config) || publicGateway
    // Normalize: remove trailing slashes to avoid double slashes when constructing paths
    return url.replace(/\/+$/, '')
  }
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
    const address = (Array.isArray(config.Addresses[name])
      ? config.Addresses[name][0]
      : config.Addresses[name])
      .replace(/\/0\.0\.0\.0\//, '/127.0.0.1/') // fix for https://github.com/ipfs/ipfs-webui/issues/1821
      .replace(/\/::\//, '/::1/')
    const url = toUri(address, { assumeHttp: true })
    if (new URL(url).port === 0) throw Error('port set to 0, not deterministic')
    return url
  } catch (error) {
    console.log(`Failed to get url from config at Addresses.${name}`, error)
    return null
  }
}

export default bundle

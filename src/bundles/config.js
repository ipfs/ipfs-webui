import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

// Find all the nodes and path boundaries traversed along a given path
const bundle = createAsyncResourceBundle({
  name: 'config',
  actionBaseType: 'CONFIG',
  getPromise: async ({getIpfs}) => {
    const rawConfig = await getIpfs().config.get()
    return JSON.parse(rawConfig, null, 2)
  },
  staleAfter: 60000,
  checkIfOnline: false
})

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

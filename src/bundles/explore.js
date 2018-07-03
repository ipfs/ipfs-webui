import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { resolveIpldPath, quickSplitPath } from '../lib/path'

// Find all the nodes and path boundaries traversed along a given path
const bundle = createAsyncResourceBundle({
  name: 'explore',
  actionBaseType: 'EXPLORE',
  getPromise: async (args) => {
    const {store, getIpfs} = args
    const hash = store.selectHash()
    const path = hash.replace('/explore', '')
    if (!path) return null
    const {cidOrFqdn, rest} = quickSplitPath(path)
    const {targetNode, canonicalPath, localPath, nodes, pathBoundaries} = await resolveIpldPath(getIpfs, cidOrFqdn, rest)
    return {
      path,
      targetNode,
      canonicalPath,
      localPath,
      nodes,
      pathBoundaries
    }
  },
  staleAfter: Infinity,
  checkIfOnline: false
})

// Fetch the explore data when the address in the url hash changes.
bundle.reactExploreFetch = createSelector(
  'selectExploreIsLoading',
  'selectExploreIsWaitingToRetry',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectExplore',
  (isLoading, isWaitingToRetry, ipfsReady, {url, params}, obj) => {
    if (!isLoading && !isWaitingToRetry && ipfsReady && url.startsWith('/explore')) {
      if (!obj || obj.path !== params.path) {
        return { actionCreator: 'doFetchExplore' }
      }
    }
  }
)

export default bundle

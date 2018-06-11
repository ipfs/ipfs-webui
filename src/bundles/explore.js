import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { resolveIpldPath, quickSplitPath } from '../lib/path'

/*
How to deal with loading? How to deal with sub node values, vs whole node values.

- page can work with node.
- graph crumb needs all the intermediate nodes.
- links change the hash directly, which leads to invalid paths if we're still loading previous.

= hide links while loading (quick fix)
*/
const bundle = createAsyncResourceBundle({
  name: 'explore',
  actionBaseType: 'EXPLORE',
  getPromise: async (args) => {
    const {store, getIpfs} = args
    const hash = store.selectHash()
    const path = hash.replace('/explore', '')
    const {cidOrFqdn, rest} = quickSplitPath(path)
    console.log('explore getPromise', {cidOrFqdn, rest})
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

bundle.reactExploreFetch = createSelector(
  'selectExploreIsLoading',
  'selectExploreIsWaitingToRetry',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectExplore',
  (isLoading, isWaitingToRetry, ipfsReady, {url, params}, obj) => {
    if (!isLoading && !isWaitingToRetry && ipfsReady && url.startsWith('/explore') && params.path) {
      if (!obj || obj.path !== params.path) {
        return { actionCreator: 'doFetchExplore' }
      }
    }
  }
)

console.log('explore bundle', bundle)

export default bundle

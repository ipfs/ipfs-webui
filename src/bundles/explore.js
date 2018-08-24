import Cid from 'cids'
import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { resolveIpldPath, quickSplitPath } from '../lib/path'

// Find all the nodes and path boundaries traversed along a given path
const bundle = createAsyncResourceBundle({
  name: 'explore',
  actionBaseType: 'EXPLORE',
  getPromise: async (args) => {
    const {store, getIpfs} = args
    let path = store.selectExplorePathFromHash()
    if (!path) return null
    const pathParts = quickSplitPath(path)
    if (!pathParts) return null
    const {cidOrFqdn, rest} = pathParts
    try {
      // TODO: handle ipns, which would give us a fqdn in the cid position.
      const cid = new Cid(cidOrFqdn)
      const {
        targetNode,
        canonicalPath,
        localPath,
        nodes,
        pathBoundaries
      } = await resolveIpldPath(getIpfs, cid.toBaseEncodedString(), rest)

      return {
        path,
        targetNode,
        canonicalPath,
        localPath,
        nodes,
        pathBoundaries
      }
    } catch (error) {
      console.log('Failed to resolve path', path, error)
      return { path, error }
    }
  },
  staleAfter: Infinity,
  checkIfOnline: false
})

bundle.selectExplorePathFromHash = createSelector(
  'selectRouteInfo',
  (routeInfo) => {
    if (!routeInfo.url.startsWith('/explore')) return
    if (!routeInfo.params.path) return
    return decodeURIComponent(routeInfo.params.path)
  }
)

// Fetch the explore data when the address in the url hash changes.
bundle.reactExploreFetch = createSelector(
  'selectIpfsReady',
  'selectExploreIsLoading',
  'selectExploreIsWaitingToRetry',
  'selectExplorePathFromHash',
  'selectExplore',
  (ipfsReady, isLoading, isWaitingToRetry, explorePathFromHash, obj) => {
    // Wait for ipfs or the pending request to complete
    if (!ipfsReady || isLoading || isWaitingToRetry) return false
    // Theres no url path and no data so nothing to do.
    if (!explorePathFromHash && !obj) return false
    // We already have the data for the path.
    if (obj && explorePathFromHash === obj.path) return false

    return { actionCreator: 'doFetchExplore' }
  }
)

export default bundle

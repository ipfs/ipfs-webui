import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { resolveIpldPath, quickSplitPath } from '../lib/path'

/*
{
  loading: false
  data: {
    path: '/ipfs/QmHash/foo/bar'
    value: {}
    nodes: []
    pathBoundaries: []
  }
}
*/
const bundle = createAsyncResourceBundle({
  name: 'explore',
  actionBaseType: 'EXPLORE',
  getPromise: (args) => {
    const {store, getIpfs} = args
    const hash = store.selectHash()
    const path = hash.replace('/explore', '')
    const {cidOrFqdn, rest} = quickSplitPath(path)
    return resolveIpldPath(getIpfs, cidOrFqdn, rest)
  },
  staleAfter: 100,
  checkIfOnline: false
})

bundle.reactExploreFetch = createSelector(
  'selectExploreShouldUpdate',
  'selectIpfsReady',
  'selectRouteInfo',
  'selectExplore',
  (shouldUpdate, ipfsReady, {url, params}, obj) => {
    if (shouldUpdate && ipfsReady && url.startsWith('/explore') && params.path) {
      if (!obj || obj.path !== params.path) {
        return { actionCreator: 'doFetchExplore' }
      }
    }
  }
)

console.log('explore bundle', bundle)

export default bundle

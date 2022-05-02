import Cid from 'cids'
import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import resolveIpldPath from '../lib/resolve-ipld-path'
import parseIpldPath from '../lib/parse-ipld-path'

// Find all the nodes and path boundaries traversed along a given path
const makeBundle = () => {
  // Lazy load ipld because it is a large dependency
  let IpldResolver = null
  let ipldFormats = null

  const bundle = createAsyncResourceBundle({
    name: 'explore',
    actionBaseType: 'EXPLORE',
    getPromise: async (args) => {
      const { store, getIpfs } = args
      const path = store.selectExplorePathFromHash()
      if (!path) return null
      const pathParts = parseIpldPath(path)
      if (!pathParts) return null
      const { cidOrFqdn, rest } = pathParts
      try {
        if (!IpldResolver) {
          const { ipld, formats } = await getIpld()

          IpldResolver = ipld
          ipldFormats = formats
        }
        const ipld = makeIpld(IpldResolver, ipldFormats, getIpfs)
        // TODO: handle ipns, which would give us a fqdn in the cid position.
        const cid = new Cid(cidOrFqdn)
        const {
          targetNode,
          canonicalPath,
          localPath,
          nodes,
          pathBoundaries
        } = await resolveIpldPath(ipld, cid, rest)

        return {
          path,
          targetNode,
          canonicalPath,
          localPath,
          nodes,
          pathBoundaries
        }
      } catch (error) {
        console.warn('Failed to resolve path', path, error)
        return { path, error: error.toString() }
      }
    },
    staleAfter: Infinity,
    checkIfOnline: false
  })

  bundle.selectExplorePathFromHash = createSelector(
    'selectRouteInfo',
    (routeInfo) => {
      if (!routeInfo.url.startsWith('/explore')) return
      const path = routeInfo.url.slice('/explore'.length)
      return decodeURIComponent(path)
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

  // Unpack append a dag link target to the current path and update the url hash
  bundle.doExploreLink = (link) => ({ store }) => {
    const { nodes, pathBoundaries } = store.selectExplore()
    const cid = nodes[0].cid
    const pathParts = pathBoundaries.map(p => p.path)
    // add the extra path step from the link to the end
    if (link && link.path) {
      pathParts.push(link.path)
    }
    // add the root cid to the start
    pathParts.unshift(cid)
    const path = pathParts.join('/')
    const hash = `#/explore/${path}`
    store.doUpdateHash(hash)
  }

  // validate user submitted path and put it in url hash fragment
  bundle.doExploreUserProvidedPath = (path) => ({ store }) => {
    const hash = path ? `#/explore${ensureLeadingSlash(path)}` : '#/explore'
    store.doUpdateHash(hash)
  }

  return bundle
}

function ensureLeadingSlash (str) {
  if (str.startsWith('/')) return str
  return `/${str}`
}

function makeIpld (IpldResolver, ipldFormats, getIpfs) {
  return new IpldResolver({
    blockService: getIpfs().block,
    formats: ipldFormats
  })
}

async function getIpld () {
  const ipldDeps = await Promise.all([
    import(/* webpackChunkName: "ipld" */ 'ipld'),
    import(/* webpackChunkName: "ipld" */ 'ipld-dag-cbor'),
    import(/* webpackChunkName: "ipld" */ 'ipld-dag-pb'),
    import(/* webpackChunkName: "ipld" */ 'ipld-git'),
    import(/* webpackChunkName: "ipld" */ 'ipld-raw'),
    import(/* webpackChunkName: "ipld" */ 'ipld-ethereum')
  ])

  // CommonJs exports object is .default when imported ESM style
  const [ipld, ...formats] = ipldDeps.map(mod => mod.default)

  // ipldEthereum is an Object, each key points to a ipld format impl
  const ipldEthereum = formats.pop()
  formats.push(...Object.values(ipldEthereum))

  return { ipld, formats }
}

export default makeBundle

import { normaliseDagNode } from './dag'

/**
 * Walk an IPLD path to find all the nodes and path boundaries it traverses.
 *
 * Normalizes nodes into a common structure:
 *
 * ```js
 * { cid: String, type: 'dag-cbor' | 'dag-pb', data: Object, links: [{cid, name}] }
 * ```
 *
 * Path boundaries capture the source and target cid where a path cross a link:
 *
 * ```js
 * { linkPath: 'a/b', source: `zdpHash1` target: `zdpHash2`' }
 * ```
 *
 * Usage:
 * ```js
 * const res = resolveIpldPath(getIpfs, 'zdpuHash' '/favourites/0/a/css')
 * const {value, canonicalPath, nodes, pathBoundaries} = res
 * ```
 *
 * @param {function()} getIpfs ipfs accessor
 * @param {string} sourceCid the root hash
 * @param {string} path everything after the hash
 * @param {Object[]} nodes accumulated node info
 * @param {Object[]} pathBoundaries accumulated path boundary info
 * @returns {{value: Object, remainderPath: String, canonicalPath: String, nodes: Object[], pathBoundaries: Object[]}} resolved path info
 */
export async function resolveIpldPath (getIpfs, sourceCid, path, nodes = [], pathBoundaries = []) {
  // TODO: find out why ipfs.dag.get with localResolve never resolves.
  // const {value, remainderPath} = await getIpfs().dag.get(sourceCid, path, {localResolve: true})
  const {value} = await getIpfs().dag.get(sourceCid)

  const node = normaliseDagNode(value, sourceCid)
  nodes.push(node)

  const link = findPathBoundaryLink(node, path)
  if (link) {
    pathBoundaries.push(link)
    const relPath = path.startsWith('/') ? path.substring(1) : path
    const remainderPath = relPath.replace(link.path, '')
    // Go again, using the link.target as the sourceCid, and the remainderPath as the path.
    return resolveIpldPath(getIpfs, link.target, remainderPath, nodes, pathBoundaries)
  }

  // we made it to the containing node. Hand back the info
  const canonicalPath = path ? `${sourceCid}${path}` : sourceCid
  let targetNode = node
  return {targetNode, canonicalPath, localPath: path, nodes, pathBoundaries}
}

/**
 * Find the link that must be traversed to resolve the path or null if none.
 *
 * @param {Object} node a `normalisedDagNode`
 * @param {Object} path an IPLD path string
 * @returns {Object} the first link you hit while traversing the path or null
 */
export function findPathBoundaryLink (node, path) {
  if (!path) return null
  if (!node) return null
  const {links} = node
  const normalisedPath = path.startsWith('/') ? path.substring(1) : path
  const link = links.reduce((longest, link) => {
    if (link && normalisedPath.startsWith(link.path)) {
      if (!longest || link.path.length > longest.path.length) {
        return link
      }
    }
    return longest
  }, null)
  return link
}

/*
  Capture groups 1
  1: ipns | ipfs | ipld
  2: CID | fqdn
  3: /rest
*/
const pathRegEx = /(\/(ipns|ipfs|ipld)\/)?([^/]+)(\/.*)?/

export function quickSplitPath (str) {
  const res = pathRegEx.exec(str)
  if (!res) return null
  return {
    namespace: res[2], // 'ipfs'
    cidOrFqdn: res[3], // 'QmHash'
    rest: res[4], // /foo/bar
    address: res[0] // /ipfs/QmHash/foo/bar
  }
}

import Cid from 'cids'
import IpldResolver from 'ipld'
import { normaliseDagNode } from './dag'

/**
 * Walk an IPLD path to find all the nodes and path boundaries it traverses.
 *
 * Normalizes nodes into a common structure:
 *
 * ```js
 * { cid: String, type: 'dag-cbor' | 'dag-pb' | 'git-raw' | ..., data: *, links: [{cid, name}] }
 * ```
 *
 * Path boundaries capture the source and target cid where a path traverses a link:
 *
 * ```js
 * { linkPath: 'a/b', source: `zdpHash1` target: `zdpHash2`' }
 * ```
 *
 * Usage:
 * ```js
 * const res = resolveIpldPath(getIpfs, 'zdpuHash' '/favourites/0/a/css')
 * const {targetNode, canonicalPath, localPath, nodes, pathBoundaries} = res
 * ```
 * Where:
 * - `targetNode` is the normalised node that the path lands in.
 * - `canonicalPath` is the shortest cid + path that can be used to locate the targetNode
 * - `localPath` is the tail part of the path that is local to the targetNode. May be ''
 * - `nodes` is the array of nodes that the path traverses.
 * - `pathBoundaries` is the array of links that the path traverses.
 *
 * @param {function()} getIpfs ipfs accessor
 * @param {string} sourceCid the root hash
 * @param {string} path everything after the hash
 * @param {Object[]} nodes accumulated node info
 * @param {Object[]} pathBoundaries accumulated path boundary info
 * @returns {{targetNode: Object, canonicalPath: String, localPath: String, nodes: Object[], pathBoundaries: Object[]}} resolved path info
 */
export async function resolveIpldPath (getIpfs, sourceCid, path, nodes = [], pathBoundaries = []) {
  // TODO: find out why ipfs.dag.get with localResolve never resolves.
  // const {value, remainderPath} = await getIpfs().dag.get(sourceCid, path, {localResolve: true})

  // TODO: use ipfs.dag.get when it gets ipld super powers
  // SEE: https://github.com/ipfs/js-ipfs-api/pull/755
  // const {value} = await getIpfs().dag.get(sourceCid)

  const {value} = await ipldGet(getIpfs, sourceCid)

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

export function ipldGet (getIpfs, cid, path, options) {
  return new Promise((resolve, reject) => {
    const ipld = new IpldResolver(getIpfs().block)
    ipld.get(new Cid(cid), path, options, (err, res) => {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

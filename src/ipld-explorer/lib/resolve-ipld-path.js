import normaliseDagNode from './normalise-dag-node'
import Cid from 'cids'

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
 * @param {function()} ipldGet fn that returns a promise of the ipld data for a (cid, path, options)
 * @param {string} sourceCid the root hash
 * @param {string} path everything after the hash
 * @param {Object[]} nodes accumulated node info
 * @param {Object[]} pathBoundaries accumulated path boundary info
 * @returns {{targetNode: Object, canonicalPath: String, localPath: String, nodes: Object[], pathBoundaries: Object[]}} resolved path info
 */
export default async function resolveIpldPath (ipld, sourceCid, path, nodes = [], pathBoundaries = []) {
  const { value, remainderPath } = await ipldGetNodeAndRemainder(ipld, sourceCid, path)
  const sourceCidStr = sourceCid.toString()

  const node = normaliseDagNode(value, sourceCidStr)
  nodes.push(node)

  const linkPath = findLinkPath(path, remainderPath)
  const link = findLink(node, linkPath)
  if (link) {
    pathBoundaries.push(link)
    // Go again, using the link.target as the sourceCid, and the remainderPath as the path.
    return resolveIpldPath(ipld, new Cid(link.target), remainderPath, nodes, pathBoundaries)
  }
  // we made it to the containing node. Hand back the info
  const canonicalPath = path ? `${sourceCidStr}${path}` : sourceCidStr
  const targetNode = node
  return { targetNode, canonicalPath, localPath: path, nodes, pathBoundaries }
}

export async function ipldGetNodeAndRemainder (ipld, sourceCid, path) {
  // TODO: find out why ipfs.dag.get with localResolve never resolves.
  // const {value, remainderPath} = await getIpfs().dag.get(sourceCid, path, {localResolve: true})

  // TODO: use ipfs.dag.get when it gets ipld super powers
  // SEE: https://github.com/ipfs/js-ipfs-api/pull/755
  // const {value} = await getIpfs().dag.get(sourceCid)

  // TODO: handle indexing into dag-pb links without using Links prefix as per go-ipfs dag.get does.
  // Current js-ipld-dag-pb resolver will throw with a path not available error if Links prefix is missing.
  return {
    value: await ipld.get(sourceCid),
    remainderPath: (await ipld.resolve(sourceCid, path || '/').first()).remainderPath
  }
}

/**
 * Find the link object that matches linkPath
 *
 * @param {Object} node a `normalisedDagNode`
 * @param {Object} linkPath an IPLD path string
 * @returns {Object} the link object for `linkPath`
 */
export function findLink (node, linkPath) {
  if (!linkPath) return null
  if (!node) return null
  const { links } = node
  const link = links.find(link => link.path === linkPath)
  return link
}

export function findLinkPath (fullPath, remainderPath) {
  if (!fullPath || fullPath === '/') return null
  if (!remainderPath) return trimSlashes(fullPath)
  if (!fullPath.endsWith(remainderPath)) {
    throw new Error('Requested IPLD path should end with the remainder path', { fullPath, remainderPath })
  }
  // Remove remainder path from end of full path to get link path
  const linkPath = fullPath.substring(0, fullPath.length - remainderPath.length)
  return trimSlashes(linkPath)
}

export function trimSlashes (str) {
  if (str.startsWith('/')) {
    str = str.substring(1)
  }
  if (str.endsWith('/')) {
    str = str.substring(0, str.length - 1)
  }
  return str
}

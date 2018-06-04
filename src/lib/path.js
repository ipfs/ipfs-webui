import { explainDagNode } from './dag'
import { findFirstLinkInPath } from './cbor'

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

// {value, canonicalPath, nodes, pathBoundaries} = resolveIpldPath(getIpfs, '/ipfs/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a/css')

/**
 * Walk an IPLD path to find all the nodes and path boundaries it traverses.
 * @param {function()} getIpfs ipfs accessor
 * @param {string} sourceCid the root hash
 * @param {string} path everything after the hash
 * @param {Object[]} nodes accumulated node info
 * @param {Object[]} pathBoundaries accumulated path boundary info
 * @returns {{value: Object, remainderPath: String, canonicalPath: String, node: Object[], pathBoundaries: Object[]}} resolved path info
 */
export async function resolveIpldPath (getIpfs, sourceCid, path, nodes = [], pathBoundaries = []) {
  const {value, remainderPath} = await getIpfs().dag.get(sourceCid, path, {localResolve: true})
  const node = explainDagNode(value)
  node.cid = sourceCid
  nodes.push(node)
  const link = findFirstLinkInPath(node, path)
  if (link) {
    const {linkCid, linkPath} = link
    pathBoundaries.push({
      linkPath,
      source: node.cid,
      target: linkCid
    })
    return resolveIpldPath(getIpfs, linkCid, remainderPath, nodes, pathBoundaries)
  }
  // we made it to the containing node. Hand back the info
  const canonicalPath = `${sourceCid}/${remainderPath}`
  return {value: node, remainderPath, canonicalPath, nodes, pathBoundaries}
}

/*
/ipfs/zdpuAs8sJjcmsPUfB1bUViftCZ8usnvs2cXrPH6MDyT4zrvSs/favourites/0/a/css

const pathBoundaries = [
  { 'linkPath': '/ipfs/zdpu/favourites/0', source: `zdpu`, target: 'z2'}
  { 'linkPath': 'a', source: `z2`, target: 'Qm1'}
  { 'linkPath': 'css', source: `Qm1`, target: 'Qm2'}
]

const nodes = [
  {
    cid: zdpu,
    type: 'dag-cbor',
    data: { ... }
    links: []
  }
]
*/

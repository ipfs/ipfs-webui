import {toCidStrOrNull} from './dag'

export function isPathInThisNode (node, path) {
  if (!path) return true
  if (!node) return false

  const parts = path.split('/').filter(p => !!p)
  if (parts.length === 0) return true
  let current = node
  return parts.every(p => {
    current = current[p]
    return current && !current['/']
  }, node)
}

export function findFirstLinkInPath (node, path) {
  if (!path) return null
  if (!node) return null
  const parts = path.split('/').filter(p => !!p)
  if (parts.length === 0) return null
  let current = node
  let link = null
  let index = 0
  while (current && !link) {
    const p = parts[index++]
    current = current[p]
    link = current ? toCidStrOrNull(current['/']) : null
  }
  return link
}

export async function findCid (getIpfs, node, rootCid, rest) {
  // until ipfs.dag.resolve is available, we have to walk the path to find the nearest cid.
  // dag.resolve https://github.com/ipfs/js-ipfs-api/pull/755#issuecomment-386882099
  const firstLinkCid = findFirstLinkInPath(node, rest)
  if (!firstLinkCid) {
    // we're in the right node.
    return rootCid
  } else {
    const {value: nextNode} = await getIpfs().dag.get(firstLinkCid)
    return findCid(getIpfs, nextNode, firstLinkCid, rest)
  }
}

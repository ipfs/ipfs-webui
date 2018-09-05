import { toCidStrOrNull } from './cid'

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
  let linkCid = null
  let index = 0
  while (current && !linkCid) {
    const key = parts[index++]
    current = current[key]
    linkCid = current ? toCidStrOrNull(current['/']) : null
  }
  if (!linkCid) return null
  const linkPath = '/' + parts.slice(0, index).join('/')
  return { linkCid, linkPath }
}

export async function findCid (getIpfs, cid, path) {
  const { value: node } = await getIpfs().dag.get(cid)
  // until ipfs.dag.resolve is available, we have to walk the path to find the nearest cid.
  // dag.resolve https://github.com/ipfs/js-ipfs-api/pull/755#issuecomment-386882099
  const firstLinkCid = findFirstLinkInPath(node, path)
  if (!firstLinkCid) {
    // we're in the right node.
    return cid
  } else {
    return findCid(getIpfs, firstLinkCid, path)
  }
}

export async function findPathBoundaries (getIpfs, cid, path, nodes = []) {
  const { value: node } = await getIpfs().dag.get(cid)
  // until ipfs.dag.resolve is available, we have to walk the path to find the nearest cid.
  // dag.resolve https://github.com/ipfs/js-ipfs-api/pull/755#issuecomment-386882099
  const firstLinkCid = findFirstLinkInPath(node, path)
  if (!firstLinkCid) {
    // we're in the right node.
    return cid
  } else {
    return findCid(getIpfs, firstLinkCid, path)
  }
}

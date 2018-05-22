import { DAGNode } from 'ipld-dag-pb'
import unixfs from 'ipfs-unixfs'
import CID from 'cids'

export function explainDagNode (node) {
  if (DAGNode.isDAGNode(node)) {
    return explainDagPb(node)
  }
  return explainDagCbor(node)
}

export function explainDagPb (node) {
  node = node.toJSON()
  let format
  try {
    // it's a unix system?
    const {type, data, blockSizes} = unixfs.unmarshal(node.data)
    node.data = {type, data, blockSizes}
    format = `unixfs`
  } catch (err) {
    // dag-pb but not a unixfs.
    console.log(err)
  }
  return {
    type: 'dag-pb',
    format,
    ...node
  }
}

export function explainDagCbor (obj) {
  const links = findIpldLinks(obj)
  return {
    type: 'dag-cbor',
    data: obj,
    links: links
  }
}

function toCidStrOrNull (value) {
  try {
    const cid = new CID(value)
    return cid.toBaseEncodedString()
  } catch (err) {
    return null
  }
}

// valid link...
// must be object with single "/" property.
//
// [
//   'a/b/c': zHash,
//   'other': zHash
// ]
export function findIpldLinks (obj, name = '') {
  if (!obj || !typeof obj === 'object' || Buffer.isBuffer(obj) || typeof obj === 'string') {
    return []
  }

  if (Array.isArray(obj)) {
    return obj
      .map((val, i) => findIpldLinks(val, name ? `${name}/${i}` : `${i}`))
      .reduce((a, b) => a.concat(b))
      .filter(a => !!a)
  }

  const keys = Object.keys(obj)

  if (keys.length === 1 && keys[0] === '/') {
    const multihash = toCidStrOrNull(obj['/'])
    if (!multihash) return []
    return [{name, multihash}]
  } else if (keys.length > 0) {
    // recurse
    return keys
      .map(key => findIpldLinks(obj[key], name ? `${name}/${key}` : `${key}`))
      .reduce((a, b) => a.concat(b))
      .filter(a => !!a)
  } else {
    return []
  }
}

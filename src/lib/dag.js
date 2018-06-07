import { DAGNode } from 'ipld-dag-pb'
import unixfs from 'ipfs-unixfs'
import { toCidStrOrNull } from './cid'

/**
 * Provide a uniform shape for all^ node types.
 *
 * Spare the rest of the codebase from having to cope with all possible node
 * shapes.
 *
 * ^: currently dag-cbor and dag-pb are supported.
 *
 * @param {Object} node a DagNode instance or an CBOR object from `ipfs.dag.get`
 * @param {String} cid the cid string passed to `ipfs.dag.get`
 */
export function normaliseDagNode (node, cid) {
  if (DAGNode.isDAGNode(node)) {
    return normaliseDagPb(node, cid)
  }
  return normaliseDagCbor(node, cid)
}

/*
 * Normalize links and add type info. Add unixfs info where available
 */
export function normaliseDagPb (node, cid) {
  if (toCidStrOrNull(node.multihash) !== cid) {
    throw new Error('dag-pb multihash should match provided cid')
  }
  node = node.toJSON()
  let format
  try {
    // it's a unix system?
    const unixfsData = unixfs.unmarshal(node.data)
    node.data = unixfsData
    format = `unixfs`
  } catch (err) {
    // dag-pb but not a unixfs.
    // console.log(err)
  }

  return {
    cid,
    type: 'dag-pb',
    data: node.data,
    links: normaliseDagPbLinks(node),
    size: node.size,
    format
  }
}

/*
 * Convert DagLink shape into normalized form that can be used interchangeably
 * with links found in dag-cbor
 */
export function normaliseDagPbLinks (node) {
  return node.links.map(({name, size, multihash}) => ({
    path: name,
    source: node.multihash,
    target: multihash,
    size
  }))
}

/*
 * Find links and add type and cid info
 */
export function normaliseDagCbor (obj, cid) {
  const links = findDagCborLinks(obj, cid)
  return {
    cid,
    type: 'dag-cbor', // TODO: extract from cid, to support more exotic types.
    data: obj,
    links: links
  }
}

/**
 * A valid IPLD link in a dag-cbor node is an object with single "/" property.
 */
export function findDagCborLinks (obj, sourceCid, path = '') {
  if (!obj || !typeof obj === 'object' || Buffer.isBuffer(obj) || typeof obj === 'string') {
    return []
  }

  if (Array.isArray(obj)) {
    return obj
      .map((val, i) => findDagCborLinks(val, sourceCid, path ? `${path}/${i}` : `${i}`))
      .reduce((a, b) => a.concat(b))
      .filter(a => !!a)
  }

  const keys = Object.keys(obj)

  if (keys.length === 1 && keys[0] === '/') {
    const target = toCidStrOrNull(obj['/'])
    if (!target) return []
    return [{path, source: sourceCid, target}]
  } else if (keys.length > 0) {
    return keys
      .map(key => findDagCborLinks(obj[key], sourceCid, path ? `${path}/${key}` : `${key}`))
      .reduce((a, b) => a.concat(b))
      .filter(a => !!a)
  } else {
    return []
  }
}

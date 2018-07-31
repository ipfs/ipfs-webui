import unixfs from 'ipfs-unixfs'
import { toCidOrNull, toCidStrOrNull, getCodecOrNull } from './cid'

/**
 * Provide a uniform shape for all^ node types.
 *
 * Spare the rest of the codebase from having to cope with all possible node
 * shapes.
 *
 * ^: currently dag-cbor and dag-pb are supported.
 *
 * @param {Object} node the `value` prop from `ipfs.dag.get` response.
 * @param {String} cid the cid string passed to `ipfs.dag.get`
 */
export function normaliseDagNode (node, cidStr) {
  const type = getCodecOrNull(cidStr)
  if (type === 'dag-pb') {
    return normaliseDagPb(node, cidStr, type)
  }
  // try cbor style if we don't know any better
  return normaliseDagCbor(node, cidStr, type)
}

/*
 * Normalize links and add type info. Add unixfs info where available
 */
export function normaliseDagPb (node, cid, type) {
  if (toCidStrOrNull(node.multihash) !== cid) {
    throw new Error('dag-pb multihash should match provided cid')
  }
  node = node.toJSON()
  let format
  try {
    // it's a unix system?
    const {type, data, blockSizes} = unixfs.unmarshal(node.data)
    node.data = {type, data, blockSizes}
    format = `unixfs`
  } catch (err) {
    // dag-pb but not a unixfs.
    // console.log(err)
  }

  return {
    cid,
    type,
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
export function normaliseDagCbor (obj, cid, type) {
  const links = findAndReplaceDagCborLinks(obj, cid)
  return {
    cid,
    type,
    data: obj,
    links: links
  }
}

/**
 * A valid IPLD link in a dag-cbor node is an object with single "/" property.
 */
export function findAndReplaceDagCborLinks (obj, sourceCid, path = '') {
  if (!obj || !typeof obj === 'object' || Buffer.isBuffer(obj) || typeof obj === 'string') {
    return []
  }

  if (Array.isArray(obj)) {
    return obj
      .map((val, i) => findAndReplaceDagCborLinks(val, sourceCid, path ? `${path}/${i}` : `${i}`))
      .reduce((a, b) => a.concat(b))
      .filter(a => !!a)
  }

  const keys = Object.keys(obj)

  if (keys.length === 1 && keys[0] === '/') {
    const targetCid = toCidOrNull(obj['/'])
    if (!targetCid) return []
    const target = targetCid.toBaseEncodedString()
    obj['/'] = target
    return [{path, source: sourceCid, target}]
  } else if (keys.length > 0) {
    return keys
      .map(key => findAndReplaceDagCborLinks(obj[key], sourceCid, path ? `${path}/${key}` : `${key}`))
      .reduce((a, b) => a.concat(b))
      .filter(a => !!a)
  } else {
    return []
  }
}

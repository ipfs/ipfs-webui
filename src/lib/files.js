import filesize from 'filesize'
/**
 * @typedef {import('ipfs').IPFSService} IPFSService
 * @typedef {import('kubo-rpc-client').KuboRPCClient} KuboRPCClient
 * @typedef {import('../bundles/files/actions').FileStat} FileStat
 * @typedef {import('multiformats/cid').CID} CID
 */

/**
 * @typedef {Object} FileExt
 * @property {string} [filepath]
 * @property {string} [webkitRelativePath]
 *
 * @typedef {FileExt &  File} ExtendedFile
 *
 * @typedef {Object} FileStream
 * @property {string} path
 * @property {Blob} content
 * @property {number} size
 *
 * @param {ExtendedFile[]} files
 * @returns {FileStream[]}
 */
export function normalizeFiles (files) {
  const streams = []

  for (const file of files) {
    streams.push({
      path: file.filepath || file.webkitRelativePath || file.name,
      content: file,
      size: file.size
    })
  }

  return streams
}

/**
 * @param {string} type
 * @param {string} name
 * @param {CID} cid
 * @param {string} gatewayUrl
 * @returns {string}
 */
function getDownloadURL (type, name, cid, gatewayUrl) {
  if (type === 'directory') {
    const filename = `${name || `download_${cid.toString()}`}.tar`
    return `${gatewayUrl}/ipfs/${cid.toString()}?download=true&format=tar&filename=${filename}`
  } else {
    const filename = `${name || cid}`
    return `${gatewayUrl}/ipfs/${cid.toString()}?download=true&filename=${filename}`
  }
}

/**
 * @param {FileStat[]} files
 * @param {IPFSService} ipfs
 * @returns {Promise<CID>}
 */
export async function makeCIDFromFiles (files, ipfs) {
  // Note: we don't use 'object patch' here, it was deprecated.
  // We are using MFS for creating CID of an ephemeral directory
  // because it handles HAMT-sharding of big directories automatically
  // See: https://github.com/ipfs/kubo/issues/8106
  const dirpath = `/zzzz_${Date.now()}`
  await ipfs.files.mkdir(dirpath, {})

  for (const { cid, name } of files) {
    await ipfs.files.cp(`/ipfs/${cid}`, `${dirpath}/${name}`)
  }

  const stat = await ipfs.files.stat(dirpath)

  // Do not wait for this
  ipfs.files.rm(dirpath, { recursive: true })

  return stat.cid
}

/**
 *
 * @param {FileStat[]} files
 * @param {string} gatewayUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<string>}
 */
export async function getDownloadLink (files, gatewayUrl, ipfs) {
  if (files.length === 1) {
    return getDownloadURL(files[0].type, files[0].name, files[0].cid, gatewayUrl)
  }

  const cid = await makeCIDFromFiles(files, ipfs)
  return getDownloadURL('directory', '', cid, gatewayUrl)
}

/**
 * Generates a shareable link for the provided files using a subdomain gateway as default or a path gateway as fallback.
 *
 * @param {FileStat[]} files - An array of file objects with their respective CIDs and names.
 * @param {string} gatewayUrl - The URL of the default IPFS gateway.
 * @param {string} subdomainGatewayUrl - The URL of the subdomain gateway.
 * @param {IPFSService} ipfs - The IPFS service instance for interacting with the IPFS network.
 * @returns {Promise<string>} - A promise that resolves to the shareable link for the provided files.
 */
export async function getShareableLink (files, gatewayUrl, subdomainGatewayUrl, ipfs) {
  let cid
  let filename

  if (files.length === 1) {
    cid = files[0].cid
    if (files[0].type === 'file') {
      filename = `?filename=${encodeURIComponent(files[0].name)}`
    }
  } else {
    cid = await makeCIDFromFiles(files, ipfs)
  }

  const url = new URL(subdomainGatewayUrl)

  /**
   * dweb.link (subdomain isolation) is listed first as the new default option.
   * However, ipfs.io (path gateway fallback) is also listed for CIDs that cannot be represented in a 63-character DNS label.
   * This allows users to customize both the subdomain and path gateway they use, with the subdomain gateway being used by default whenever possible.
   */
  let shareableLink = ''
  const base32Cid = cid.toV1().toString()
  if (base32Cid.length < 64) {
    shareableLink = `${url.protocol}//${base32Cid}.ipfs.${url.host}${filename || ''}`
  } else {
    shareableLink = `${gatewayUrl}/ipfs/${cid}${filename || ''}`
  }

  return shareableLink
}

/**
 *
 * @param {FileStat[]} files
 * @param {string} gatewayUrl
 * @param {IPFSService} ipfs
 * @returns {Promise<string>}
 */
export async function getCarLink (files, gatewayUrl, ipfs) {
  let cid, filename

  if (files.length === 1) {
    cid = files[0].cid
    filename = encodeURIComponent(files[0].name)
  } else {
    cid = await makeCIDFromFiles(files, ipfs)
  }

  return `${gatewayUrl}/ipfs/${cid}?format=car&filename=${filename || cid}.car`
}

/**
 * @param {number} size in bytes
 * @param {object} opts format customization
 * @returns {string} human-readable size
 */
export function humanSize (size, opts) {
  if (typeof size === 'undefined' || size === null) return 'N/A'
  return filesize(size || 0, {
    // base-2 byte units (GiB, MiB, KiB) to remove any ambiguity
    spacer: String.fromCharCode(160), // non-breakable space (&nbsp)
    round: size >= 1073741824 ? 1 : 0, // show decimal > 1GiB
    standard: 'iec',
    base: 2,
    bits: false,
    ...opts
  })
}

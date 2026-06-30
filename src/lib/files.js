import filesize from 'filesize'
/**
 * @typedef {import('kubo-rpc-client').KuboRPCClient} IPFSService
 * @typedef {import('../bundles/files/actions').FileStat} FileStat
 * @typedef {import('multiformats/cid').CID} CID
 */

/**
 * @typedef {import('../files/types').FileExt} FileExt
 *
 * @typedef {import('../files/types').ExtendedFile} ExtendedFile
 *
 *
 * @param {ExtendedFile[]} files
 * @returns {import('../files/types').FileStream[]}
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
 * Build the `?filename=...` query that hints a gateway at a download name.
 * Only a single file gets one; directories and multi-file selections do not.
 *
 * @param {FileStat[]} files
 * @returns {string} the query string, or '' when no filename hint applies
 */
function getFilenameQuery (files) {
  if (files.length === 1 && files[0].type === 'file') {
    return `?filename=${encodeURIComponent(files[0].name)}`
  }
  return ''
}

// Loopback hosts, matched against a URL hostname (IPv6 keeps its brackets). They
// all reach the same local node, so its links use canonical forms: the IP for
// the path link (no DNS needed) and localhost for the subdomain link (subdomain
// origins need a hostname). https://github.com/ipfs/ipfs-webui/issues/1490
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '[::]'])
const LOOPBACK_IP = '127.0.0.1'
const LOOPBACK_HOSTNAME = 'localhost'

/**
 * Whether a URL hostname is a bare IP literal rather than a domain name.
 * Subdomain gateways serve one origin per CID under a parent domain, so they
 * cannot be built on an IP such as 192.168.1.5.
 *
 * @param {string} hostname - a URL hostname (IPv6 keeps its surrounding brackets)
 * @returns {boolean}
 */
function isIpHostname (hostname) {
  // IPv6 literals are bracketed in a URL hostname, e.g. [::1]
  if (hostname.startsWith('[')) {
    return true
  }
  // IPv4 dotted quad, e.g. 127.0.0.1
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
}

/**
 * Generates a shareable link for the provided files using a subdomain gateway as default or a path gateway as fallback.
 *
 * @param {FileStat[]} files - An array of file objects with their respective CIDs and names.
 * @param {string} gatewayUrl - The URL of the default IPFS gateway.
 * @param {string} subdomainGatewayUrl - The URL of the subdomain gateway.
 * @param {IPFSService} ipfs - The IPFS service instance for interacting with the IPFS network.
 * @returns {Promise<{link: string, cid: CID}>} - A promise that resolves to an object containing the shareable link and root CID.
 */
export async function getShareableLink (files, gatewayUrl, subdomainGatewayUrl, ipfs) {
  const cid = files.length === 1 ? files[0].cid : await makeCIDFromFiles(files, ipfs)
  const filename = getFilenameQuery(files)
  const url = new URL(subdomainGatewayUrl)

  /**
   * dweb.link (subdomain isolation) is listed first as the new default option.
   * However, ipfs.io (path gateway fallback) is also listed for CIDs that cannot be represented in a 63-character DNS label.
   * This allows users to customize both the subdomain and path gateway they use, with the subdomain gateway being used by default whenever possible.
   */
  const base32Cid = cid.toV1().toString()
  const shareableLink = base32Cid.length < 64
    ? `${url.protocol}//${base32Cid}.ipfs.${url.host}${filename}`
    : `${gatewayUrl}/ipfs/${cid}${filename}`

  return { link: shareableLink, cid }
}

/**
 * Build local gateway links for opening content in other apps on the same
 * machine, honoring the user's Local Gateway URL override.
 *
 * For a loopback gateway (localhost, 127.0.0.1, ...) the two links use canonical
 * forms: the path link uses 127.0.0.1 (no DNS needed) and the subdomain link
 * uses localhost (subdomain origins need a hostname). A real domain gateway
 * keeps its host for both. A non-loopback IP gets no subdomain link, and neither
 * does a CIDv1 too long for a 63-character DNS label; subdomainLocalLink is ''.
 *
 * @param {FileStat[]} files
 * @param {CID} cid - root CID, already resolved by getShareableLink
 * @param {string} gatewayUrl - the local gateway URL
 * @returns {{localLink: string, subdomainLocalLink: string}}
 */
export function getLocalLinks (files, cid, gatewayUrl) {
  const filename = getFilenameQuery(files)
  const url = new URL(gatewayUrl)
  const isLoopback = LOOPBACK_HOSTNAMES.has(url.hostname)
  const port = url.port ? `:${url.port}` : ''

  const localLink = isLoopback
    ? `${url.protocol}//${LOOPBACK_IP}${port}/ipfs/${cid}${filename}`
    : `${gatewayUrl}/ipfs/${cid}${filename}`

  const base32Cid = cid.toV1().toString()
  let subdomainLocalLink = ''
  if (base32Cid.length < 64) {
    if (isLoopback) {
      subdomainLocalLink = `${url.protocol}//${base32Cid}.ipfs.${LOOPBACK_HOSTNAME}${port}${filename}`
    } else if (!isIpHostname(url.hostname)) {
      subdomainLocalLink = `${url.protocol}//${base32Cid}.ipfs.${url.host}${filename}`
    }
  }

  return { localLink, subdomainLocalLink }
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

// Cache for tracking provide operations to avoid spamming the network
const provideCache = new Map()
const PROVIDE_DEBOUNCE_TIME = 15 * 60 * 1000 // 15 minutes in milliseconds

/**
 * Debounced function to provide a CID to the IPFS DHT network.
 *
 * @param {CID} cid - The CID to provide to the network
 * @param {IPFSService} ipfs - The IPFS service instance
 */
export async function debouncedProvide (cid, ipfs) {
  const cidStr = cid.toString()
  const now = Date.now()
  const lastProvideTime = provideCache.get(cidStr)

  if (lastProvideTime != null && (now - lastProvideTime) < PROVIDE_DEBOUNCE_TIME) {
    return
  }

  try {
    const provideEvents = ipfs.routing.provide(cid, { recursive: false })

    for await (const event of provideEvents) {
      // @ts-expect-error - event type doesn't have messageName in types but it exists at runtime
      if (event.messageName === 'PUT_VALUE') {
        console.debug(`[PROVIDE] ${cidStr}:`, event)
      }
    }

    // Clean up old cache entries
    for (const [cachedCid, timestamp] of provideCache.entries()) {
      if ((now - timestamp) > PROVIDE_DEBOUNCE_TIME) {
        provideCache.delete(cachedCid)
      }
    }

    provideCache.set(cidStr, now)
  } catch (error) {
    console.error(`[PROVIDE] Failed for CID ${cidStr}:`, error)
  }
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

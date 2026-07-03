// Import via 'multiformats/basics' rather than the per-encoding subpaths: the
// subpaths only ship an ESM `exports` condition, which the app's Jest resolver
// mis-resolves to the package root (leaving e.g. base36 undefined).
import { CID, bases, digest as Digest } from 'multiformats/basics'

const { base36, base58btc } = bases

/**
 * @typedef {import('../bundles/files/actions').FileStat} FileStat
 */

// libp2p-key multicodec, the codec of an IPNS name expressed as a CID.
const LIBP2P_KEY_CODEC = 0x72

/**
 * The kinds of link the Share Link and Publish to IPNS flows can produce. The
 * value is what we persist in localStorage, so keep these strings stable.
 */
export const SHARE_LINK_TYPE = {
  NATIVE: 'native',
  LOCAL_PATH: 'local-path',
  LOCAL_SUBDOMAIN: 'local-subdomain',
  PUBLIC_PATH: 'public-path',
  PUBLIC_SUBDOMAIN: 'public-subdomain'
}

// Default to native ipfs:// URIs: a fresh node shares app-agnostic addresses
// rather than routing through a third-party public gateway until the user opts in.
export const DEFAULT_SHARE_LINK_TYPE = SHARE_LINK_TYPE.NATIVE

// A subdomain gateway puts the CID (or IPNS name) in a DNS label, which is
// capped at 63 characters.
const DNS_LABEL_MAX = 63

// Loopback hosts reach the same local node, so local links use canonical forms:
// the IP for path links and subresources (no DNS, and no localhost subdomain
// redirect that some browsers force-upgrade to https, see
// https://github.com/ipfs/ipfs-webui/issues/2246) and localhost for subdomain
// links (subdomain origins need a hostname).
// https://github.com/ipfs/ipfs-webui/issues/1490
const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '[::]'])
const LOOPBACK_IPV4 = '127.0.0.1'
const LOOPBACK_IPV6 = '[::1]'
const LOOPBACK_HOSTNAME = 'localhost'

/**
 * The canonical loopback IP for a loopback hostname, keeping the address
 * family of the input ([::] and [::1] stay IPv6).
 *
 * @param {string} hostname - a member of LOOPBACK_HOSTNAMES
 * @returns {string}
 */
function loopbackIp (hostname) {
  return hostname.startsWith('[') ? LOOPBACK_IPV6 : LOOPBACK_IPV4
}

/**
 * Whether a loopback host in this URL may be rewritten to another loopback
 * form. Only http qualifies: an https certificate covers the exact hostname,
 * so swapping localhost and 127.0.0.1 would break TLS validation.
 *
 * @param {URL} url
 * @returns {boolean}
 */
function isRewritableLoopback (url) {
  return url.protocol === 'http:' && LOOPBACK_HOSTNAMES.has(url.hostname)
}

/**
 * Rewrite a loopback host in an http URL to its canonical IP form (127.0.0.1
 * or [::1]). This is the form for subresources (img/video/object embeds) and
 * path links: it avoids Kubo's localhost subdomain redirect, which some
 * browsers treat as an insecure context and force-upgrade to https, breaking
 * the load (https://github.com/ipfs/ipfs-webui/issues/2246). Accepts a full
 * content URL or a bare gateway root; https, non-loopback, and unparseable
 * values pass through unchanged.
 *
 * @param {string} url
 * @returns {string}
 */
export function toLoopbackIpUrl (url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  if (!isRewritableLoopback(parsed)) return url
  // Surgical host swap: URL serialization would append a trailing slash to a
  // bare gateway root, breaking callers that concatenate paths onto it.
  return url.replace(parsed.hostname, loopbackIp(parsed.hostname))
}

/**
 * Build the `?filename=...` query that hints a gateway at a download name.
 * Only a single file gets one; directories and multi-file selections do not.
 *
 * @param {FileStat[]} files
 * @returns {string} the query string, or '' when no filename hint applies
 */
export function getFilenameQuery (files) {
  if (files.length === 1 && files[0].type === 'file') {
    return `?filename=${encodeURIComponent(files[0].name)}`
  }
  return ''
}

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
 * Build a path gateway link: `<gateway>/<namespace>/<id>`.
 *
 * @param {string} gatewayUrl
 * @param {string} namespace - 'ipfs' or 'ipns'
 * @param {string} id - CID string or IPNS name
 * @param {string} filename - `?filename=...` query, or ''
 * @param {{loopback?: boolean}} [opts] - normalize an http loopback host to its IP form
 * @returns {string} the link, or '' when gatewayUrl is empty
 */
function pathLink (gatewayUrl, namespace, id, filename, opts = {}) {
  if (!gatewayUrl) return ''
  const url = new URL(gatewayUrl)
  let host = url.host
  if (opts.loopback && isRewritableLoopback(url)) {
    const port = url.port ? `:${url.port}` : ''
    host = `${loopbackIp(url.hostname)}${port}`
  }
  // Preserve any subpath the gateway is mounted under (e.g. a reverse proxy at
  // https://example.com/gw); '/' collapses to an empty base.
  const base = url.pathname.replace(/\/+$/, '')
  return `${url.protocol}//${host}${base}/${namespace}/${id}${filename}`
}

/**
 * Build a subdomain gateway link: `<label>.<namespace>.<gateway-host>`, giving
 * the content its own origin. Returns '' when it cannot be represented: no
 * gateway, a label longer than a DNS label allows, or a host that is a bare IP.
 *
 * @param {string} gatewayUrl
 * @param {string} namespace - 'ipfs' or 'ipns'
 * @param {string} label - base32 CIDv1 or IPNS name to place in the DNS label
 * @param {string} filename - `?filename=...` query, or ''
 * @param {{loopback?: boolean}} [opts] - normalize an http loopback host to localhost
 * @returns {string}
 */
function subdomainLink (gatewayUrl, namespace, label, filename, opts = {}) {
  if (!gatewayUrl || !label || label.length > DNS_LABEL_MAX) return ''
  const url = new URL(gatewayUrl)
  let hostname = url.hostname
  if (opts.loopback && isRewritableLoopback(url)) hostname = LOOPBACK_HOSTNAME
  if (isIpHostname(hostname)) return ''
  const port = url.port ? `:${url.port}` : ''
  return `${url.protocol}//${label}.${namespace}.${hostname}${port}${filename}`
}

/**
 * Build a single content link of the requested type, for the `/ipfs` (Share
 * Link) or `/ipns` (Publish to IPNS) namespace. Public subdomain links fall
 * back to the public path gateway when the label is too long for DNS (and to a
 * native URI when there is no path gateway either); local subdomain links fall
 * back to the local path link. Returns '' only when the type's own gateway is
 * missing (a local type with no localGatewayUrl, or public path with no
 * publicGateway); resolveEffectiveShareLinkType maps those cases to NATIVE
 * first, so share flows always get a usable link.
 *
 * @param {object} opts
 * @param {string} opts.type - a SHARE_LINK_TYPE value
 * @param {string} opts.namespace - 'ipfs' or 'ipns'
 * @param {string} opts.pathId - identifier for path links (CID or IPNS name)
 * @param {string} opts.subdomainLabel - the canonical v1 form used for subdomain
 *   and native links (base32 CIDv1 for /ipfs, base36 libp2p-key for /ipns)
 * @param {string} [opts.filename] - `?filename=...` query, or ''
 * @param {string} opts.localGatewayUrl - local gateway, honoring the user override
 * @param {string} [opts.publicGateway] - public path gateway; may be '' or omitted for local/native types
 * @param {string} [opts.publicSubdomainGateway] - public subdomain gateway; may be '' or omitted for local/native types
 * @returns {string}
 */
export function buildShareLink ({ type, namespace, pathId, subdomainLabel, filename = '', localGatewayUrl, publicGateway, publicSubdomainGateway }) {
  switch (type) {
    case SHARE_LINK_TYPE.NATIVE:
      // Native URIs use the canonical v1 form: a base32 CIDv1 for /ipfs (so a
      // CIDv0 Qm... becomes bafy...) and a base36 libp2p-key for /ipns. The
      // filename query is kept so a resolver (e.g. IPFS Companion) forwards it
      // to the gateway as the download name.
      return `${namespace}://${subdomainLabel}${filename}`
    case SHARE_LINK_TYPE.LOCAL_PATH:
      return pathLink(localGatewayUrl, namespace, pathId, filename, { loopback: true })
    case SHARE_LINK_TYPE.LOCAL_SUBDOMAIN:
      return subdomainLink(localGatewayUrl, namespace, subdomainLabel, filename, { loopback: true }) ||
        pathLink(localGatewayUrl, namespace, pathId, filename, { loopback: true })
    case SHARE_LINK_TYPE.PUBLIC_PATH:
      return pathLink(publicGateway || '', namespace, pathId, filename)
    case SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN:
      // A label too long for DNS with no path gateway configured still gets a
      // native URI, never an empty link.
      return subdomainLink(publicSubdomainGateway || '', namespace, subdomainLabel, filename) ||
        pathLink(publicGateway || '', namespace, pathId, filename) ||
        `${namespace}://${subdomainLabel}${filename}`
    default:
      return ''
  }
}

/**
 * Local gateway link for opening content in a new tab (file preview and IPNS
 * key links). Honors the Share Link type from Settings: the localhost
 * subdomain form (per-content origin, so untrusted content cannot touch
 * another CID's cookies or storage) when the user chose the local subdomain
 * gateway, the IP path form otherwise. Returns '' when there is no local
 * gateway.
 *
 * @param {object} opts
 * @param {string} opts.shareLinkType - the stored SHARE_LINK_TYPE
 * @param {string} opts.namespace - 'ipfs' or 'ipns'
 * @param {string} opts.pathId - identifier for path links (CID or IPNS name)
 * @param {string} opts.subdomainLabel - base32 CIDv1 or base36 IPNS name
 * @param {string} [opts.filename] - `?filename=...` query, or ''
 * @param {string} opts.localGatewayUrl - local gateway only, no public fallback
 * @returns {string}
 */
export function getLocalContentLink ({ shareLinkType, namespace, pathId, subdomainLabel, filename = '', localGatewayUrl }) {
  const type = shareLinkType === SHARE_LINK_TYPE.LOCAL_SUBDOMAIN
    ? SHARE_LINK_TYPE.LOCAL_SUBDOMAIN
    : SHARE_LINK_TYPE.LOCAL_PATH
  return buildShareLink({ type, namespace, pathId, subdomainLabel, filename, localGatewayUrl })
}

/**
 * The local path and subdomain links for a CID, used by the Share modal to
 * offer a local link even when the configured type is native or public. The
 * subdomain link is '' when the CID cannot be represented as one.
 *
 * @param {CID} cid - root CID
 * @param {string} filename - `?filename=...` query, or ''
 * @param {string} localGatewayUrl
 * @returns {{localLink: string, subdomainLocalLink: string}}
 */
export function getLocalLinks (cid, filename, localGatewayUrl) {
  return {
    localLink: pathLink(localGatewayUrl, 'ipfs', cid.toString(), filename, { loopback: true }),
    subdomainLocalLink: subdomainLink(localGatewayUrl, 'ipfs', cid.toV1().toString(), filename, { loopback: true })
  }
}

/**
 * An example local link, with a literal "CID" placeholder, showing the shape a
 * local option produces (e.g. http://127.0.0.1:8080/ipfs/CID for path, or
 * http://CID.ipfs.localhost:8080 for subdomain). Shown in Settings so users can
 * see what a local option will build. Returns '' when the gateway is unusable.
 *
 * @param {string} gatewayUrl - the local gateway URL (honors the user override)
 * @param {{subdomain?: boolean}} [opts]
 * @returns {string}
 */
export function gatewayExample (gatewayUrl, opts = {}) {
  try {
    return buildShareLink({
      type: opts.subdomain ? SHARE_LINK_TYPE.LOCAL_SUBDOMAIN : SHARE_LINK_TYPE.LOCAL_PATH,
      namespace: 'ipfs',
      pathId: 'CID',
      subdomainLabel: 'CID',
      localGatewayUrl: gatewayUrl
    })
  } catch {
    // Malformed gateway URL: skip the example rather than throwing.
    return ''
  }
}

/**
 * Normalize an IPNS name to a base36 libp2p-key CIDv1 (k51...), the form
 * gateways expect in subdomains and native ipns:// URIs. Accepts a name that is
 * already such a CID, a base32 libp2p-key CID, or a base58btc PeerID
 * (12D3Koo... for ed25519, Qm... for RSA). Returns the input unchanged when it
 * cannot be parsed as either.
 *
 * @param {string} name
 * @returns {string}
 */
export function toIpnsBase36 (name) {
  try {
    const cid = CID.parse(name)
    if (cid.code === LIBP2P_KEY_CODEC) {
      return cid.toV1().toString(base36)
    }
  } catch {
    // Not a CID string; fall through to the PeerID path below.
  }
  try {
    // A PeerID is a base58btc multihash with no multibase prefix.
    const digest = Digest.decode(base58btc.decode(`z${name}`))
    return CID.createV1(LIBP2P_KEY_CODEC, digest).toString(base36)
  } catch {
    // Leave unrecognized input untouched rather than breaking the link.
    return name
  }
}

/**
 * Resolve the link type actually used. A type whose gateway is not configured
 * (a public type with its gateway cleared, or a local type with no local
 * gateway at all) falls back to native (ipfs://), so links never silently
 * break or point at an unconfigured gateway. buildShareLink is guaranteed to
 * return a non-empty link for the type this resolves to.
 *
 * @param {string} type - the stored SHARE_LINK_TYPE
 * @param {{publicGateway: string, publicSubdomainGateway: string, localGatewayUrl: string}} gateways
 * @returns {string} the effective SHARE_LINK_TYPE
 */
export function resolveEffectiveShareLinkType (type, { publicGateway, publicSubdomainGateway, localGatewayUrl }) {
  const isLocal = type === SHARE_LINK_TYPE.LOCAL_PATH || type === SHARE_LINK_TYPE.LOCAL_SUBDOMAIN
  if (isLocal && !localGatewayUrl) return SHARE_LINK_TYPE.NATIVE
  if (type === SHARE_LINK_TYPE.PUBLIC_PATH && !publicGateway) return SHARE_LINK_TYPE.NATIVE
  if (type === SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN && !publicSubdomainGateway) return SHARE_LINK_TYPE.NATIVE
  return type
}

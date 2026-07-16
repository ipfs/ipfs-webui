/* global describe, it, expect */
import { CID } from 'multiformats/cid'
import {
  SHARE_LINK_TYPE,
  buildShareLink,
  getLocalLinks,
  getLocalContentLink,
  getFilenameQuery,
  resolveEffectiveShareLinkType,
  toIpnsBase36,
  toLoopbackIpUrl,
  gatewayExample
} from './share-link.js'

const cid = CID.parse('QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V')
const CID_BASE32 = 'bafybeifffq3aeaymxejo37sn5fyaf7nn7hkfmzwdxyjculx3lw4tyhk7uy'
// A base32 CIDv1 whose label exceeds the 63-char DNS limit, so it cannot be a
// subdomain label and must fall back to a path link.
const LONG_CID = CID.parse('bagaaifcavabu6fzheerrmtxbbwv7jjhc3kaldmm7lbnvfopyrthcvod4m6ygpj3unrcggkzhvcwv5wnhc5ufkgzlsji7agnmofovc2g4a3ui7ja')
const IPNS_NAME = 'k51qzi5uqu5dl2yn0d6xu8q5aqa61jh8zeyixz9tsju80n15ssiyew48912c63'

// Reachable gateways shared across the link-type cases below.
const LOCAL = 'http://127.0.0.1:8080'
const PUBLIC_PATH = 'https://ipfs.io'
const PUBLIC_SUBDOMAIN = 'https://dweb.link'

const ipfsLink = (type, overrides = {}) => buildShareLink({
  type,
  namespace: 'ipfs',
  pathId: cid.toString(),
  subdomainLabel: cid.toV1().toString(),
  filename: '?filename=example.txt',
  localGatewayUrl: LOCAL,
  publicGateway: PUBLIC_PATH,
  publicSubdomainGateway: PUBLIC_SUBDOMAIN,
  ...overrides
})

const ipnsLink = (type, overrides = {}) => buildShareLink({
  type,
  namespace: 'ipns',
  pathId: IPNS_NAME,
  subdomainLabel: IPNS_NAME,
  filename: '',
  localGatewayUrl: LOCAL,
  publicGateway: PUBLIC_PATH,
  publicSubdomainGateway: PUBLIC_SUBDOMAIN,
  ...overrides
})

describe('buildShareLink for /ipfs', () => {
  it('native uses an ipfs:// URI with a base32 CIDv1 (converts CIDv0) and keeps the filename', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.NATIVE)).toBe(`ipfs://${CID_BASE32}?filename=example.txt`)
  })

  it('preserves a gateway mounted under a subpath', () => {
    const link = ipfsLink(SHARE_LINK_TYPE.PUBLIC_PATH, { publicGateway: 'https://example.com/gw' })
    expect(link).toBe(`https://example.com/gw/ipfs/${cid}?filename=example.txt`)
  })

  it('local path uses the loopback IP', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_PATH)).toBe(`http://127.0.0.1:8080/ipfs/${cid}?filename=example.txt`)
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_PATH, { localGatewayUrl: 'http://localhost:8080' })).toBe(`http://127.0.0.1:8080/ipfs/${cid}?filename=example.txt`)
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_PATH, { localGatewayUrl: 'http://0.0.0.0:8080' })).toBe(`http://127.0.0.1:8080/ipfs/${cid}?filename=example.txt`)
  })

  it('local path keeps the IPv6 address family', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_PATH, { localGatewayUrl: 'http://[::1]:8080' })).toBe(`http://[::1]:8080/ipfs/${cid}?filename=example.txt`)
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_PATH, { localGatewayUrl: 'http://[::]:8080' })).toBe(`http://[::1]:8080/ipfs/${cid}?filename=example.txt`)
  })

  it('local path does not rewrite an https loopback host (TLS cert covers the exact hostname)', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_PATH, { localGatewayUrl: 'https://localhost:8443' })).toBe(`https://localhost:8443/ipfs/${cid}?filename=example.txt`)
  })

  it('local subdomain uses localhost', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN)).toBe(`http://${CID_BASE32}.ipfs.localhost:8080?filename=example.txt`)
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, { localGatewayUrl: 'http://[::1]:8080' })).toBe(`http://${CID_BASE32}.ipfs.localhost:8080?filename=example.txt`)
  })

  it('local subdomain does not rewrite an https loopback IP, falling back to the path link', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, { localGatewayUrl: 'https://127.0.0.1:8443' })).toBe(`https://127.0.0.1:8443/ipfs/${cid}?filename=example.txt`)
  })

  it('local subdomain falls back to the local path for a non-loopback IP gateway', () => {
    const link = ipfsLink(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, { localGatewayUrl: 'http://192.168.1.5:8080' })
    expect(link).toBe(`http://192.168.1.5:8080/ipfs/${cid}?filename=example.txt`)
  })

  it('public path uses the public path gateway', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.PUBLIC_PATH)).toBe(`https://ipfs.io/ipfs/${cid}?filename=example.txt`)
  })

  it('public subdomain uses the public subdomain gateway', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)).toBe(`https://${CID_BASE32}.ipfs.dweb.link?filename=example.txt`)
  })

  it('public path is empty when no public path gateway is set', () => {
    expect(ipfsLink(SHARE_LINK_TYPE.PUBLIC_PATH, { publicGateway: '' })).toBe('')
  })

  it('public subdomain falls back to the public path gateway for an over-long CID', () => {
    const link = buildShareLink({
      type: SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN,
      namespace: 'ipfs',
      pathId: LONG_CID.toString(),
      subdomainLabel: LONG_CID.toV1().toString(),
      filename: '',
      localGatewayUrl: LOCAL,
      publicGateway: PUBLIC_PATH,
      publicSubdomainGateway: PUBLIC_SUBDOMAIN
    })
    expect(link).toBe(`https://ipfs.io/ipfs/${LONG_CID}`)
  })

  it('public subdomain falls back to a native URI for an over-long CID with no path gateway', () => {
    const link = buildShareLink({
      type: SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN,
      namespace: 'ipfs',
      pathId: LONG_CID.toString(),
      subdomainLabel: LONG_CID.toV1().toString(),
      filename: '',
      localGatewayUrl: LOCAL,
      publicGateway: '',
      publicSubdomainGateway: PUBLIC_SUBDOMAIN
    })
    expect(link).toBe(`ipfs://${LONG_CID.toV1()}`)
  })

  it('local subdomain falls back to the local path for an over-long CID', () => {
    const link = buildShareLink({
      type: SHARE_LINK_TYPE.LOCAL_SUBDOMAIN,
      namespace: 'ipfs',
      pathId: LONG_CID.toString(),
      subdomainLabel: LONG_CID.toV1().toString(),
      filename: '',
      localGatewayUrl: LOCAL,
      publicGateway: PUBLIC_PATH,
      publicSubdomainGateway: PUBLIC_SUBDOMAIN
    })
    expect(link).toBe(`http://127.0.0.1:8080/ipfs/${LONG_CID}`)
  })
})

describe('buildShareLink for /ipns', () => {
  it('native uses an ipns:// URI', () => {
    expect(ipnsLink(SHARE_LINK_TYPE.NATIVE)).toBe(`ipns://${IPNS_NAME}`)
  })

  it('local path uses the loopback IP', () => {
    expect(ipnsLink(SHARE_LINK_TYPE.LOCAL_PATH)).toBe(`http://127.0.0.1:8080/ipns/${IPNS_NAME}`)
  })

  it('local subdomain uses localhost', () => {
    expect(ipnsLink(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN)).toBe(`http://${IPNS_NAME}.ipns.localhost:8080`)
  })

  it('public path uses the public path gateway', () => {
    expect(ipnsLink(SHARE_LINK_TYPE.PUBLIC_PATH)).toBe(`https://ipfs.io/ipns/${IPNS_NAME}`)
  })

  it('public subdomain uses the public subdomain gateway', () => {
    expect(ipnsLink(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN)).toBe(`https://${IPNS_NAME}.ipns.dweb.link`)
  })
})

describe('getLocalLinks', () => {
  it('returns a loopback path link and a localhost subdomain link', () => {
    const { localLink, subdomainLocalLink } = getLocalLinks(cid, '?filename=example.txt', 'http://127.0.0.1:8080')
    expect(localLink).toBe(`http://127.0.0.1:8080/ipfs/${cid}?filename=example.txt`)
    expect(subdomainLocalLink).toBe(`http://${CID_BASE32}.ipfs.localhost:8080?filename=example.txt`)
  })

  it('returns an empty subdomain link for a non-loopback IP gateway', () => {
    const { localLink, subdomainLocalLink } = getLocalLinks(cid, '', 'http://192.168.1.5:8080')
    expect(localLink).toBe(`http://192.168.1.5:8080/ipfs/${cid}`)
    expect(subdomainLocalLink).toBe('')
  })

  it('returns an empty subdomain link for an over-long CID', () => {
    const { localLink, subdomainLocalLink } = getLocalLinks(LONG_CID, '', 'http://127.0.0.1:8080')
    expect(localLink).toBe(`http://127.0.0.1:8080/ipfs/${LONG_CID}`)
    expect(subdomainLocalLink).toBe('')
  })
})

describe('getLocalContentLink', () => {
  it('uses the subdomain form only when the user chose the local subdomain type', () => {
    const opts = { namespace: 'ipfs', pathId: cid.toString(), subdomainLabel: cid.toV1().toString(), localGatewayUrl: 'http://localhost:8080' }
    expect(getLocalContentLink({ shareLinkType: SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, ...opts })).toBe(`http://${CID_BASE32}.ipfs.localhost:8080`)
    expect(getLocalContentLink({ shareLinkType: SHARE_LINK_TYPE.NATIVE, ...opts })).toBe(`http://127.0.0.1:8080/ipfs/${cid}`)
    expect(getLocalContentLink({ shareLinkType: SHARE_LINK_TYPE.PUBLIC_PATH, ...opts })).toBe(`http://127.0.0.1:8080/ipfs/${cid}`)
  })

  it('returns empty when there is no local gateway', () => {
    expect(getLocalContentLink({ shareLinkType: SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, namespace: 'ipfs', pathId: cid.toString(), subdomainLabel: cid.toV1().toString(), localGatewayUrl: '' })).toBe('')
  })
})

describe('toLoopbackIpUrl', () => {
  it('rewrites http loopback hosts to 127.0.0.1', () => {
    expect(toLoopbackIpUrl('http://localhost:8080/ipfs/bafy?filename=a.txt')).toBe('http://127.0.0.1:8080/ipfs/bafy?filename=a.txt')
    expect(toLoopbackIpUrl('http://localhost/ipfs/bafy')).toBe('http://127.0.0.1/ipfs/bafy')
    expect(toLoopbackIpUrl('http://0.0.0.0:8080/ipfs/bafy')).toBe('http://127.0.0.1:8080/ipfs/bafy')
  })

  it('rewrites http IPv6 loopback to [::1]', () => {
    expect(toLoopbackIpUrl('http://[::]:8080/ipfs/bafy')).toBe('http://[::1]:8080/ipfs/bafy')
    expect(toLoopbackIpUrl('http://[::1]:8080/ipfs/bafy')).toBe('http://[::1]:8080/ipfs/bafy')
  })

  it('keeps a bare gateway root free of a trailing slash', () => {
    expect(toLoopbackIpUrl('http://localhost:8080')).toBe('http://127.0.0.1:8080')
  })

  it('leaves other hosts, schemes, and non-URLs unchanged', () => {
    expect(toLoopbackIpUrl('http://127.0.0.1:8080/ipfs/bafy')).toBe('http://127.0.0.1:8080/ipfs/bafy')
    expect(toLoopbackIpUrl('https://dweb.link/ipfs/bafy')).toBe('https://dweb.link/ipfs/bafy')
    expect(toLoopbackIpUrl('https://localhost:8080/ipfs/bafy')).toBe('https://localhost:8080/ipfs/bafy')
    expect(toLoopbackIpUrl('http://localhostx:8080/ipfs/bafy')).toBe('http://localhostx:8080/ipfs/bafy')
    expect(toLoopbackIpUrl('/ipfs/bafy')).toBe('/ipfs/bafy')
  })
})

describe('getFilenameQuery', () => {
  it('builds a query for a single file', () => {
    expect(getFilenameQuery([{ type: 'file', name: 'a b.txt' }])).toBe('?filename=a%20b.txt')
  })

  it('returns empty for a directory or multiple files', () => {
    expect(getFilenameQuery([{ type: 'directory', name: 'dir' }])).toBe('')
    expect(getFilenameQuery([{ type: 'file', name: 'a' }, { type: 'file', name: 'b' }])).toBe('')
  })
})

describe('gatewayExample', () => {
  it('shows a CID-placeholder path link on the loopback IP', () => {
    expect(gatewayExample('http://127.0.0.1:8080')).toBe('http://127.0.0.1:8080/ipfs/CID')
    expect(gatewayExample('http://localhost:8080')).toBe('http://127.0.0.1:8080/ipfs/CID')
  })

  it('shows a CID-placeholder subdomain link on localhost', () => {
    expect(gatewayExample('http://127.0.0.1:8080', { subdomain: true })).toBe('http://CID.ipfs.localhost:8080')
  })

  it('keeps a non-loopback gateway host', () => {
    expect(gatewayExample('https://gw.example.com')).toBe('https://gw.example.com/ipfs/CID')
    expect(gatewayExample('https://gw.example.com', { subdomain: true })).toBe('https://CID.ipfs.gw.example.com')
  })
})

describe('toIpnsBase36', () => {
  it('keeps a base36 libp2p-key name unchanged', () => {
    expect(toIpnsBase36(IPNS_NAME)).toBe(IPNS_NAME)
  })

  it('converts an ed25519 PeerID to a base36 libp2p-key', () => {
    expect(toIpnsBase36('12D3KooWD3eckifWpRn9wQpMG9R9hX3sD158z7EqHWmweQAJU5SA')).toMatch(/^k51/)
  })

  it('converts an RSA Qm PeerID to a base36 libp2p-key, not a dag-pb CID', () => {
    // Qm... parses as a dag-pb CIDv0, but as an IPNS name it is a PeerID, so it
    // must become a libp2p-key CID (base36 k2k4...), never a dag-pb one.
    expect(toIpnsBase36('QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V')).toMatch(/^k2k4/)
  })

  it('returns unrecognized input unchanged without throwing', () => {
    expect(toIpnsBase36('not-a-name')).toBe('not-a-name')
    expect(() => toIpnsBase36('')).not.toThrow()
  })
})

describe('resolveEffectiveShareLinkType', () => {
  it('keeps the type when its gateway is set', () => {
    expect(resolveEffectiveShareLinkType(SHARE_LINK_TYPE.PUBLIC_PATH, { publicGateway: 'https://ipfs.io', publicSubdomainGateway: 'https://dweb.link', localGatewayUrl: '' })).toBe(SHARE_LINK_TYPE.PUBLIC_PATH)
    expect(resolveEffectiveShareLinkType(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, { publicGateway: '', publicSubdomainGateway: '', localGatewayUrl: LOCAL })).toBe(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN)
  })

  it('falls back to native when the chosen public gateway is empty', () => {
    expect(resolveEffectiveShareLinkType(SHARE_LINK_TYPE.PUBLIC_PATH, { publicGateway: '', publicSubdomainGateway: 'https://dweb.link', localGatewayUrl: LOCAL })).toBe(SHARE_LINK_TYPE.NATIVE)
    expect(resolveEffectiveShareLinkType(SHARE_LINK_TYPE.PUBLIC_SUBDOMAIN, { publicGateway: 'https://ipfs.io', publicSubdomainGateway: '', localGatewayUrl: LOCAL })).toBe(SHARE_LINK_TYPE.NATIVE)
  })

  it('falls back to native for a local type with no local gateway', () => {
    expect(resolveEffectiveShareLinkType(SHARE_LINK_TYPE.LOCAL_PATH, { publicGateway: 'https://ipfs.io', publicSubdomainGateway: '', localGatewayUrl: '' })).toBe(SHARE_LINK_TYPE.NATIVE)
    expect(resolveEffectiveShareLinkType(SHARE_LINK_TYPE.LOCAL_SUBDOMAIN, { publicGateway: '', publicSubdomainGateway: 'https://dweb.link', localGatewayUrl: '' })).toBe(SHARE_LINK_TYPE.NATIVE)
  })
})

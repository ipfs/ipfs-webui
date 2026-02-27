import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { getConfiguredCache } from 'money-clip'
import { lookup } from 'ipfs-geoip'
import PQueue from 'p-queue'
import HLRU from 'hashlru'
import { multiaddr } from '@multiformats/multiaddr'
import ms from 'milliseconds'
import ip from 'ip'
import { createContextSelector } from '../helpers/context-bridge'
import pkgJson from '../../package.json'

const { dependencies } = pkgJson

/**
 * Selector that reads identity from the context bridge
 * Returns the same format as the original selectIdentity for compatibility
 */
const selectIdentityFromContext = createContextSelector('identity')

const selectIdentityData = () => {
  const identityContext = selectIdentityFromContext()
  return identityContext?.identity
}

// After this time interval, we re-check the locations for each peer
// once again through PeerLocationResolver.
const UPDATE_EVERY = ms.seconds(3)

// We reuse cached geoip lookups as long geoipVersion is the same.
const geoipVersion = dependencies['ipfs-geoip']

// Depends on ipfsBundle, peersBundle
function createPeersLocations (opts) {
  opts = opts || {}
  // Max number of locations to retrieve concurrently.
  // HTTP API are throttled to max 4-6 at a time by the browser itself.
  opts.concurrency = opts.concurrency || 4
  // Cache options
  opts.cache = opts.cache || {}

  const peerLocResolver = new PeerLocationResolver(opts)

  const bundle = createAsyncResourceBundle({
    name: 'peerLocations',
    actionBaseType: 'PEER_LOCATIONS',
    getPromise: ({ store }) => {
      const promise = peerLocResolver.findLocations(
        store.selectAvailableGatewayUrl(), store.selectPeers())

      if (!peerLocResolver._idleHandlerRegistered && peerLocResolver.queue.size > 0) {
        peerLocResolver._idleHandlerRegistered = true
        peerLocResolver.queue.onIdle().then(() => {
          peerLocResolver._idleHandlerRegistered = false
          store.doMarkPeerLocationsAsOutdated()
        })
      }

      return promise
    },
    staleAfter: UPDATE_EVERY,
    retryAfter: UPDATE_EVERY,
    persist: false,
    checkIfOnline: false
  })

  bundle.reactPeerLocationsFetch = createSelector(
    'selectRouteInfo',
    'selectPeerLocationsShouldUpdate',
    'selectIpfsConnected',
    (routeInfo, shouldUpdate, ipfsConnected) => {
      if (routeInfo.url === '/peers' && shouldUpdate && ipfsConnected) {
        return { actionCreator: 'doFetchPeerLocations' }
      }
    }
  )

  bundle.selectPeerLocationsForSwarm = createSelector(
    'selectPeers',
    'selectPeerLocations',
    'selectBootstrapPeers',
    selectIdentityData, // ipfs.id info from identity context, used for detecting local peers
    (peers, locations = {}, bootstrapPeers, identity) => peers && peers.map((peer) => {
      const peerId = peer.peer
      const locationObj = locations ? locations[peerId] : null
      const location = toLocationString(locationObj)
      const flagCode = locationObj && locationObj.country_code
      const coordinates = locationObj && [
        locationObj.longitude,
        locationObj.latitude
      ]
      const connection = parseConnection(peer.addr)
      const address = peer.addr.toString()
      const latency = parseLatency(peer.latency)
      const direction = peer.direction
      const { isPrivate, isNearby } = isPrivateAndNearby(peer.addr, identity)

      const protocols = (Array.isArray(peer.streams)
        ? Array.from(new Set(peer.streams
          .map(s => s.Protocol)
          .map(p => (!p?.trim() ? '[unnamed]' : p)) // mark weird 'empty' protocols
        )).sort()
        : []).join(', ')

      // Get agent version (truncation will be handled upstream in kubo via https://github.com/ipfs/kubo/pull/9465)
      const agentVersion = peer.identify?.AgentVersion

      return {
        peerId,
        location,
        flagCode,
        coordinates,
        connection,
        address,
        protocols,
        direction,
        latency,
        isPrivate,
        isNearby,
        agentVersion
      }
    })
  )

  const COORDINATES_RADIUS = 4

  bundle.selectPeersCoordinates = createSelector(
    'selectPeerLocationsForSwarm',
    (peers) => {
      if (!peers) return []

      return peers.reduce((previous, { peerId, coordinates }) => {
        if (!coordinates) return previous

        let hasFoundACloseCoordinate = false

        const previousCoordinates = previous.map(prev => {
          if (!prev || hasFoundACloseCoordinate) return prev

          const [x, y] = prev.coordinates
          const [currentX, currentY] = coordinates

          const isCloseInXAxis = x - COORDINATES_RADIUS <= currentX && x + COORDINATES_RADIUS >= currentX
          const isCloseInYAxis = y - COORDINATES_RADIUS <= currentY && y + COORDINATES_RADIUS >= currentY

          if (isCloseInXAxis && isCloseInYAxis) {
            prev.peerIds.push(peerId)
            hasFoundACloseCoordinate = true
          }

          return prev
        })

        if (hasFoundACloseCoordinate) {
          return previousCoordinates
        }

        return [...previousCoordinates, { peerIds: [peerId], coordinates }]
      }, [])
    }
  )

  return bundle
}

const isPublicIP = t =>
  (t[0] === 4 || t[0] === 41) && !ip.isPrivate(t[1])

const toLocationString = loc => {
  if (!loc) return null
  const { country_name: country, city } = loc
  return city && country ? `${country}, ${city}` : country
}

const parseConnection = (multiaddr) => {
  const protocols = multiaddr.protoNames()
    .map(p => p.startsWith('quic-v') ? 'quic' : p) // shorten quic-v1, quic-v2, etc to just 'quic'
    .join('/')
  return protocols
}

const parseLatency = (latency) => {
  if (latency === 'n/a') return

  let value = parseInt(latency)
  const unit = /(s|ms)/.exec(latency)[0]

  value = unit === 's' ? value * 1000 : value

  return value
}

let _cachedPublicIP
let _lastIdentityRef

const getPublicIP = (identity) => {
  if (!identity) return
  if (identity === _lastIdentityRef) return _cachedPublicIP

  _lastIdentityRef = identity
  _cachedPublicIP = undefined

  for (const maddr of identity.addresses) {
    try {
      const addr = multiaddr(maddr).nodeAddress()

      if ((ip.isV4Format(addr.address) || ip.isV6Format(addr.address)) && !ip.isPrivate(addr.address)) {
        _cachedPublicIP = addr.address
        return _cachedPublicIP
      }
    } catch (e) {
      // Might fail for non-IP multiaddrs, safe to ignore.
    }
  }
}

const isPrivateAndNearby = (maddr, identity) => {
  const publicIP = getPublicIP(identity)
  let isPrivate = false
  let isNearby = false
  let addr

  try {
    addr = maddr.nodeAddress()
  } catch (_) {
    // Might explode if maddr does not have an IP or cannot be converted
    // to a node address. This might happen if it's a relay. We do not print
    // or handle the error, otherwise we would get perhaps thousands of logs.
    return { isPrivate, isNearby }
  }

  // At this point, addr.address and publicIP must be valid IP addresses. Hence,
  // none of the calls bellow for ip library should fail.
  isPrivate = ip.isPrivate(addr.address)

  if (publicIP) {
    if (ip.isV4Format(addr.address)) {
      isNearby = ip.cidrSubnet(`${publicIP}/24`).contains(addr.address)
    } else if (ip.isV6Format(addr.address)) {
      isNearby = ip.cidrSubnet(`${publicIP}/48`).contains(addr.address) &&
        !ip.cidrSubnet('fc00::/8').contains(addr.address)
      // peerIP6 ∉ fc00::/8 to fix case of cjdns where IPs are not spatial allocated.
    }
  }

  return { isPrivate, isNearby }
}

class PeerLocationResolver {
  constructor (opts) {
    this.geoipCache = getConfiguredCache({
      name: 'geoipCache',
      version: geoipVersion,
      maxAge: ms.weeks(1),
      ...opts.cache
    })

    this.failedAddrs = HLRU(500)

    this.queue = new PQueue({
      concurrency: opts.concurrency,
      autoStart: true
    })

    this.geoipLookupPromises = new Map()
    this.memoryCache = HLRU(500)

    this.pass = 0
    this._idleHandlerRegistered = false
  }

  async findLocations (gatewayUrls, peers) {
    const res = {}

    // Normalize Gateway URLS:
    // switch localhost to raw IP to avoid subdomain redirect AND avoid Chrome forcing https:// on such redirect
    gatewayUrls = (Array.isArray(gatewayUrls) ? gatewayUrls : [gatewayUrls]).map(url => url.replace(/localhost:(\d+)/, '127.0.0.1:$1'))

    for (const p of this.optimizedPeerSet(peers)) {
      const peerId = p.peer

      const ipTuple = p.addr.stringTuples().find(isPublicIP)
      if (!ipTuple) {
        continue
      }

      const ipAddr = ipTuple[1]
      if (this.failedAddrs.has(ipAddr)) {
        continue
      }

      // check in-memory cache first (avoids IndexedDB reads for known IPs)
      const memoryCached = this.memoryCache.get(ipAddr)
      if (memoryCached) {
        res[peerId] = memoryCached
        continue
      }

      // maybe we have it cached by IP address in IndexedDB
      const location = await this.geoipCache.get(ipAddr)
      if (location) {
        this.memoryCache.set(ipAddr, location)
        res[peerId] = location
        continue
      }

      // no ip address cached. are we looking it up already?
      if (this.geoipLookupPromises.has(ipAddr)) {
        continue
      }

      this.geoipLookupPromises.set(ipAddr, this.queue.add(async () => {
        try {
          const data = await lookup(gatewayUrls, ipAddr)
          this.memoryCache.set(ipAddr, data)
          await this.geoipCache.set(ipAddr, data)
        } catch (e) {
          // mark this one as failed so we don't retry again
          this.failedAddrs.set(ipAddr, true)
        } finally {
          this.geoipLookupPromises.delete(ipAddr)
        }
      }))
    }

    return res
  }

  optimizedPeerSet (peers) {
    if (this.pass < 3) {
      // use a copy of peers sorted by latency so we can resolve closest ones first
      // (https://github.com/ipfs-shipyard/ipfs-webui/issues/1273)
      const ms = x => (parseLatency(x.latency) || 9999)
      const sortedPeersByLatency = peers.concat().sort((a, b) => ms(a) - ms(b))
      // take the closest subset, increase sample size each time
      // this ensures initial map updates are fast even with thousands of peers
      this.pass = this.pass + 1

      switch (this.pass - 1) {
        case 0:
          return sortedPeersByLatency.slice(0, 10)
        case 1:
          return sortedPeersByLatency.slice(0, 100)
        default:
          return sortedPeersByLatency.slice(0, 200)
      }
    }
    return peers
  }
}
export default createPeersLocations

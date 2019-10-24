import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import { getConfiguredCache } from 'money-clip'
import geoip from 'ipfs-geoip'
import PQueue from 'p-queue'
import HLRU from 'hashlru'
import ms from 'milliseconds'
import ip from 'ip'

// After this time interval, we re-check the locations for each peer
// once again through PeerLocationResolver.
const UPDATE_EVERY = ms.seconds(1)

// Depends on ipfsBundle, peersBundle
export default function (opts) {
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
    getPromise: async ({ store, getIpfs }) => {
      const peers = store.selectPeers()
      return peerLocResolver.findLocations(peers, getIpfs)
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
    'selectIdentity',
    (peers, locations = {}, bootstrapPeers, identity) => {
      const myIP = getPublicIP(identity)

      return peers && peers.map(peer => {
        const peerId = peer.peer.toB58String()
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
        const notes = parseNotes(peer, bootstrapPeers)
        const { isPrivate, isNearby } = isPrivateAndNearby(peer.addr, myIP)

        return {
          peerId,
          location,
          flagCode,
          coordinates,
          connection,
          address,
          latency,
          notes,
          isPrivate
        }
      })
    }
  )

  bundle.selectPeerCoordinates = createSelector(
    'selectPeerLocationsForSwarm',
    peers => {
      if (!peers) return []
      const allCoord = peers
        .map(p => p.coordinates)
        .filter(arr => !!arr)

      const unique = new Set(allCoord.map(JSON.stringify))
      return Array.from(unique).map(JSON.parse)
    }
  )

  return bundle
}

const isNonHomeIPv4 = t => t[0] === 4 && t[1] !== '127.0.0.1'

const toLocationString = loc => {
  if (!loc) return null
  const { country_name: country, city } = loc
  return city && country ? `${country}, ${city}` : country
}

const parseConnection = (multiaddr) => {
  return multiaddr.protoNames().join('・')
}

const parseLatency = (latency) => {
  if (latency === 'n/a') return

  let value = parseInt(latency)
  const unit = /(s|ms)/.exec(latency)[0]

  value = unit === 's' ? value * 1000 : value

  return value
}

function getPublicIP (identity) {
  if (!identity) return

  for (const maddr of identity.addresses) {
    try {
      const addr = Multiaddr(maddr).nodeAddress()
      if (!ip.isPrivate(addr.address)) {
        return addr.address
      }
    } catch (_) {}
  }
}

function isPrivateAndNearby (maddr, myIP) {
  let isPrivate = null
  let isNearby = null

  try {
    const addr = maddr.nodeAddress()
    isPrivate = ip.isPrivate(addr.address)

    if (myIP) {
      if (addr.family === 4) {
        isNearby = ip.cidrSubnet(`${myIP}/24`).contains(addr.address)
      } else if (addr.family === 6) {
        isNearby = ip.cidrSubnet(`${myIP}/48`).contains(addr.address)
          && !ip.cidrSubnet('fc00::/8').contains(addr.address)
        // peerIP6 ∉ fc00::/8 to fix case of cjdns where IPs are not spatial allocated.
      }
    }
  } catch (_) {
    isPrivate = false
    isNearby = false
  }

  return { isPrivate, isNearby }
}

const parseNotes = (peer, bootstrapPeers) => {
  const peerId = peer.peer.toB58String()
  const addr = peer.addr
  const ipfsAddr = addr.encapsulate(`/ipfs/${peerId}`).toString()
  const p2pAddr = addr.encapsulate(`/p2p/${peerId}`).toString()

  if (bootstrapPeers.includes(ipfsAddr) || bootstrapPeers.includes(p2pAddr)) {
    return { type: 'BOOTSTRAP_NODE' }
  }

  const opts = addr.toOptions()

  if (opts.transport === 'p2p-circuit') {
    return { type: 'RELAY_NODE', node: opts.host }
  }
}

class PeerLocationResolver {
  constructor (opts) {
    this.geoipCache = getConfiguredCache({
      name: 'geoipCache',
      version: 1,
      maxAge: ms.weeks(1),
      ...opts.cache
    })

    this.failedAddrs = HLRU(500)

    this.queue = new PQueue({
      concurrency: opts.concurrency,
      autoStart: true
    })

    this.geoipLookupPromises = {}

    this.pass = 0
  }

  async findLocations (peers, getIpfs) {
    const res = {}

    for (const p of this.optimizedPeerSet(peers)) {
      const peerId = p.peer.toB58String()

      const ipv4Tuple = p.addr.stringTuples().find(isNonHomeIPv4)
      if (!ipv4Tuple) {
        continue
      }

      const ipv4Addr = ipv4Tuple[1]
      if (this.failedAddrs.has(ipv4Addr)) {
        continue
      }

      // maybe we have it cached by ipv4 address already, check that.
      const location = await this.geoipCache.get(ipv4Addr)
      if (location) {
        res[peerId] = location
        continue
      }

      // no ip address cached. are we looking it up already?
      var locPromise = this.geoipLookupPromises[ipv4Addr]
      if (locPromise) {
        continue
      }

      this.geoipLookupPromises[ipv4Addr] = this.queue.add(async () => {
        return new Promise(resolve => {
          const ipfs = getIpfs()

          geoip.lookup(ipfs, ipv4Addr, (err, data) => {
            delete this.geoipLookupPromises[ipv4Addr]

            if (err) {
              // mark this one as failed so we don't retry again
              this.failedAddrs.set(ipv4Addr, true)
              return resolve()
            }

            // save the data!
            this.geoipCache.set(ipv4Addr, data)
            resolve()
          })
        })
      })
    }

    return res
  }

  optimizedPeerSet (peers) {
    if (this.pass && this.pass < 3) {
      // use a copy of peers sorted by latency so we can resolve closest ones first
      // (https://github.com/ipfs-shipyard/ipfs-webui/issues/1273)
      const ms = x => (parseLatency(x.latency) || 9999)
      peers = peers.concat().sort((a, b) => ms(a) - ms(b))
      // take the closest subset, increase sample size each time
      // this ensures initial map updates are fast even with thousands of peers
      switch (this.pass) {
        case 0:
          peers = peers.slice(0, 10)
          break
        case 1:
          peers = peers.slice(0, 100)
          break
        case 2:
          peers = peers.slice(0, 200)
          break
        default:
      }
      this.pass = this.pass + 1
    }
    return peers
  }
}

import { createSelector } from 'redux-bundler'
import { getConfiguredCache } from 'money-clip'
import geoip from 'ipfs-geoip'
import Multiaddr from 'multiaddr'
import ms from 'milliseconds'

// Depends on ipfsBundle, peersBundle
export default function (opts) {
  opts = opts || {}
  // Max number of locations to retrieve concurrently
  opts.concurrency = opts.concurrency || 10
  // Cache options
  opts.cache = opts.cache || {}

  const defaultState = {
    // Peer locations keyed by peer ID then peer address.
    // i.e. { [peerId]: { [multiaddr]: { state, data?, error? } } }
    // `state` can be queued, resolving, resolved or failed
    // `data` is the resolved location data (see ipfs-geoip docs)
    // `error` is only present if state is 'failed'
    locations: {},
    // Peer IDs in the queue for resolving ONE of their queued addresses.
    // We actually have a queue of queues since each peer may have multiple
    // addresses to resolve. Peer locations are resolved in PARALLEL but for
    // any given peer we work our way through it's list of addresses in SERIES
    // until we find one that resolves.
    queuingPeers: [],
    // Peer IDs currently resolving for one of their queued addresses
    resolvingPeers: []
  }

  const peerLocResolver = new PeerLocationResolver(opts)

  return {
    name: 'peerLocations',

    reducer (state = defaultState, action) {
      if (action.type === 'PEER_LOCATIONS_PEERS_QUEUED') {
        const { addrsByPeer, peerByAddr } = action.payload

        return {
          ...state,
          queuingPeers: state.queuingPeers.concat(Object.keys(addrsByPeer)),
          locations: Object.keys(peerByAddr).reduce((locs, addr) => {
            const peerId = peerByAddr[addr]
            locs[peerId] = locs[peerId] || {}
            locs[peerId][addr] = { state: 'queued' }
            return locs
          }, { ...state.locations })
        }
      }

      if (action.type === 'PEER_LOCATIONS_RESOLVE_STARTED') {
        const { peerId, addr } = action.payload

        return {
          ...state,
          queuingPeers: state.queuingPeers.filter(id => id !== peerId),
          resolvingPeers: state.resolvingPeers.concat(peerId),
          locations: {
            ...state.locations,
            [peerId]: {
              ...state.locations[peerId],
              [addr]: { state: 'resolving' }
            }
          }
        }
      }

      if (action.type === 'PEER_LOCATIONS_RESOLVE_FINISHED') {
        const { peerId, addr, location } = action.payload

        return {
          ...state,
          resolvingPeers: state.resolvingPeers.filter(id => id !== peerId),
          locations: {
            ...state.locations,
            [peerId]: {
              ...state.locations[peerId],
              [addr]: {
                state: 'resolved',
                data: location
              }
            }
          }
        }
      }

      if (action.type === 'PEER_LOCATIONS_RESOLVE_FAILED') {
        const { peerId, addr } = action.payload

        // Is there another queued address for this peer?
        const hasAlternate = Object.keys(state.locations[peerId])
          .filter(a => a !== addr)
          .some(a => state.locations[peerId][a].state === 'queued')

        return {
          ...state,
          resolvingPeers: state.resolvingPeers.filter(id => id !== peerId),
          // Re-queue the peer if it has another address to try
          queuingPeers: hasAlternate
            ? state.queuingPeers.concat(peerId)
            : state.queuingPeers,
          locations: {
            ...state.locations,
            [peerId]: {
              ...state.locations[peerId],
              [addr]: {
                state: 'failed',
                error: action.payload.error
              }
            }
          }
        }
      }

      return state
    },

    // Returns an object of the form:
    // { [peerId]: { [multiaddr]: { state, data?, error? } } }
    selectPeerLocationsRaw: state => state.peerLocations.locations,

    // Select just the data for the peer locations that have been resolved
    // Returns an object of the form:
    // { [peerId]: { /* location data */ } }
    selectPeerLocations: createSelector(
      'selectPeerLocationsRaw',
      peerLocsRaw => Object.keys(peerLocsRaw).reduce((locs, peerId) => {
        const locsByAddr = peerLocsRaw[peerId]
        const addr = Object.keys(locsByAddr).find(a => locsByAddr[a].state === 'resolved')
        if (addr) locs[peerId] = peerLocsRaw[peerId][addr].data
        return locs
      }, {})
    ),

    selectPeerLocationsQueuingPeers: state => state.peerLocations.queuingPeers,

    selectPeerLocationsResolvingPeers: state => state.peerLocations.resolvingPeers,

    selectPeerLocationsForSwarm: createSelector(
      'selectPeers',
      'selectPeerLocations',
      'selectBootstrapPeers',
      (peers, locations, bootstrapPeers) => peers && peers.map(peer => {
        const peerId = peer.peer.toB58String()
        const locationObj = locations[peerId]
        const location = toLocationString(locationObj)
        const flagCode = locationObj && locationObj.country_code
        const coordinates = locationObj && [
          locationObj.longitude,
          locationObj.latitude
        ]
        const connection = parseConnection(peer.addr)
        const latency = parseLatency(peer.latency)
        const notes = parseNotes(peer, bootstrapPeers)

        return {
          peerId,
          location,
          flagCode,
          coordinates,
          connection,
          latency,
          notes
        }
      })
    ),

    selectPeerCoordinates: createSelector(
      'selectPeerLocationsForSwarm',
      peers => {
        if (!peers) return []
        return peers.map(p => p.coordinates).filter(arr => !!arr)
      }
    ),

    doResolvePeerLocation: ({ peerId, addr }) => async ({ dispatch, store, getIpfs }) => {
      dispatch({ type: 'PEER_LOCATIONS_RESOLVE_STARTED', payload: { peerId, addr } })

      let location = null
      try {
        location = await peerLocResolver.lookupWithCaches(peerId, addr, getIpfs)
      } catch (err) {
        return dispatch({
          type: 'PEER_LOCATIONS_RESOLVE_FAILED',
          payload: { peerId, addr, error: err }
        })
      }

      dispatch({
        type: 'PEER_LOCATIONS_RESOLVE_FINISHED',
        payload: { peerId, addr, location }
      })
    },

    // Resolve another peer location where there's a peer in the queue and we're
    // not already resolving more than our allowed concurrency
    reactResolvePeerLocation: createSelector(
      'selectHash',
      'selectIpfsConnected',
      'selectPeerLocationsRaw',
      'selectPeerLocationsQueuingPeers',
      'selectPeerLocationsResolvingPeers',
      (hash, ipfsConnected, peerLocationsRaw, queuingPeers, resolvingPeers) => {
        if (hash === '/peers' && ipfsConnected && queuingPeers.length && resolvingPeers.length < opts.concurrency) {
          const peerId = queuingPeers[0]
          const locsByAddr = peerLocationsRaw[peerId]

          // TODO: what is causing this to fail?
          if (!locsByAddr) {
            return
          }

          const addr = Object.keys(locsByAddr).find(a => locsByAddr[a].state === 'queued')
          return { actionCreator: 'doResolvePeerLocation', args: [{ peerId, addr }] }
        }
      }
    ),

    // When the peers list changes, queue up the peers we don't already know about
    reactQueuePeerLocations: createSelector(
      'selectPeers',
      'selectPeerLocationsRaw',
      (peers, peerLocationsRaw) => {
        const payload = (peers || []).reduce(({ addrsByPeer, peerByAddr }, p) => {
          const peerId = p.peer.toB58String()
          const addr = p.addr.toString()

          if (peerLocationsRaw[peerId] && peerLocationsRaw[peerId][addr]) {
            return { addrsByPeer, peerByAddr }
          }

          addrsByPeer[peerId] = (addrsByPeer[peerId] || []).concat(addr)
          peerByAddr[addr] = peerId
          return { addrsByPeer, peerByAddr }
        }, { addrsByPeer: {}, peerByAddr: {} })

        if (Object.keys(payload.addrsByPeer).length) {
          return { type: 'PEER_LOCATIONS_PEERS_QUEUED', payload }
        }
      }
    )
  }
}

const isNonHomeIPv4 = t => t[0] === 4 && t[1] !== '127.0.0.1'

const toLocationString = loc => {
  if (!loc) return null
  const { country_name: country, city } = loc
  return city && country ? `${city}, ${country}` : country
}

const parseConnection = (multiaddr) => {
  const opts = multiaddr.toOptions()

  return `${opts.family}・${opts.transport}`
}

const parseLatency = (latency) => {
  if (latency === 'n/a') return

  let value = parseInt(latency)
  const unit = /(s|ms)/.exec(latency)[0]

  value = unit === 's' ? value * 1000 : value

  return `${value}ms`
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
  constructor(opts) {
    this.peerLocCache = getConfiguredCache({
      name: 'peerLocations',
      version: 1,
      maxAge: ms.weeks(1),
      ...opts.cache
    })

    this.geoipCache = getConfiguredCache({
      name: 'geoipCache',
      version: 1,
      maxAge: ms.weeks(1),
      ...opts.cache
    })

    this.geoipLookupPromises = {}
  }

  async lookupWithCaches(peerId, addr, getIpfs) {
    // maybe we have it cached by peerid already
    let location = await this.peerLocCache.get(peerId)
    if (location) {
      return location
    }

    const ipv4Tuple = Multiaddr(addr).stringTuples().find(isNonHomeIPv4)
    if (!ipv4Tuple) {
      throw new Error(`Unable to resolve location for non-IPv4 address ${addr}`)
    }

    var ipv4Addr = ipv4Tuple[1]

    // maybe we have it cached by ipv4 address already, check that.
    location = await this.geoipCache.get(ipv4Addr)
    if (location) {
      return location
    }

    // no ip address cached. are we looking it up already?
    var locPromise = this.geoipLookupPromises[ipv4Addr]

    if (!locPromise) {
      locPromise = new Promise((resolve, reject) => {
        const ipfs = getIpfs()
        geoip.lookup(ipfs, ipv4Addr, (err, data) => {
          // save it in the caches, and remove the promise.
          this.geoipCache.set(ipv4Addr, data)
          this.peerLocCache.set(peerId, data)
          delete this.geoipLookupPromises[ipv4Addr]

          if (err) return reject(err)
          resolve(data)
        })
      })

      // set the promise here, so we only look it up once.
      this.geoipLookupPromises[ipv4Addr] = locPromise
    }

    location = await locPromise
    return location
  }
}

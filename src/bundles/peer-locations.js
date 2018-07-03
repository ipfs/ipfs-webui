import { createSelector } from 'redux-bundler'
import geoip from 'ipfs-geoip'

// Depends on ipfsBundle, peersBundle
export default function (opts) {
  opts = opts || {}
  // Max number of flags to retrieve at once
  opts.concurrency = opts.concurrency || 5

  const defaultState = { locations: {}, queuingPeerIds: [], resolvingPeerIds: [] }

  return {
    name: 'peerLocations',

    reducer (state = defaultState, action) {
      if (action.type === 'PEER_LOCATIONS_PEERS_QUEUED') {
        return {
          ...state,
          queuingPeerIds: state.queuingPeerIds
            .concat(action.payload.peers.map(p => p.peer.toB58String())),
          locations: action.payload.peers.reduce((locs, p) => {
            locs[p.peer.toB58String()] = { state: 'queued', peer: p }
            return locs
          }, { ...state.locations })
        }
      }

      if (action.type === 'PEER_LOCATIONS_RESOLVE_STARTED') {
        const peerId = action.payload.peer.peer.toB58String()
        const nextLocations = { ...state.lcoations }

        nextLocations[peerId] = {
          ...nextLocations[peerId],
          state: 'resolving',
          data: action.payload.location
        }

        return {
          ...state,
          queuingPeerIds: state.queuingPeerIds.filter(id => id !== peerId),
          resolvingPeerIds: state.resolvingPeerIds.concat(peerId),
          locations: nextLocations
        }
      }

      if (action.type === 'PEER_LOCATIONS_RESOLVE_FINISHED') {
        const peerId = action.payload.peer.peer.toB58String()
        const nextLocations = { ...state.lcoations }

        nextLocations[peerId] = {
          ...nextLocations[peerId],
          state: 'resolved',
          data: action.payload.location
        }

        return {
          ...state,
          resolvingPeerIds: state.resolvingPeerIds.filter(id => id !== peerId),
          locations: nextLocations
        }
      }

      if (action.type === 'PEER_LOCATIONS_RESOLVE_FAILED') {
        const peerId = action.payload.peer.peer.toB58String()
        const nextLocations = { ...state.lcoations }

        nextLocations[peerId] = {
          ...nextLocations[peerId],
          state: 'failed',
          error: action.payload.error
        }

        return {
          ...state,
          resolvingPeerIds: state.resolvingPeerIds.filter(id => id !== peerId),
          locations: nextLocations
        }
      }

      return state
    },

    // Returns an object of the form:
    // { [peerId]: { state, peer, data?, error? } }
    selectPeerLocationsRaw: state => state.peerLocations.locations,

    // Select just the data for the peer locations that have been resolved
    // Returns an object of the form:
    // { [peerId]: { /* location data */ } }
    selectPeerLocations: createSelector(
      'selectPeerLocationsRaw',
      (peerLocsRaw) => Object.keys(peerLocsRaw).reduce((locs, peerId) => {
        if (peerLocsRaw[peerId].state === 'resolved') {
          locs[peerId] = peerLocsRaw[peerId].data
        }
        return locs
      }, {})
    ),

    selectPeerLocationsQueuingPeerIds: state => state.peerLocations.queuingPeerIds,
    selectPeerLocationsResolvingPeerIds: state => state.peerLocations.resolvingPeerIds,

    doResolvePeerLocation: peer => async ({ dispatch, getState, getIpfs }) => {
      dispatch({ type: 'PEER_LOCATIONS_RESOLVE_STARTED', payload: { peer } })

      const ipfs = getIpfs()
      let location

      try {
        const ipv4Tuple = peer.addr.stringTuples().find(isNonHomeIPv4)

        if (!ipv4Tuple) {
          throw new Error(`Unable to resolve location for non-IPv4 address ${peer.addr}`)
        }

        location = await new Promise((resolve, reject) => {
          geoip.lookup(ipfs, ipv4Tuple[1], (err, data) => {
            if (err) return reject(err)
            resolve(data)
          })
        })
      } catch (err) {
        return dispatch({
          type: 'PEER_LOCATIONS_RESOLVE_FAILED',
          payload: { peer, error: err }
        })
      }

      dispatch({ type: 'PEER_LOCATIONS_RESOLVE_FINISHED', payload: { peer, location } })
    },

    // Resolve another peer location where there's a peer in the queue and we're
    // not already resolving more than our allowed concurrency
    reactResolvePeerLocation: createSelector(
      'selectIpfsReady',
      'selectPeerLocationsRaw',
      'selectPeerLocationsQueuingPeerIds',
      'selectPeerLocationsResolvingPeerIds',
      (ipfsReady, peerLocationsRaw, queuingPeerIds, resolvingPeerIds) => {
        if (ipfsReady && queuingPeerIds.length && resolvingPeerIds.length < opts.concurrency) {
          const peerId = queuingPeerIds[0]
          const { peer } = peerLocationsRaw[peerId]
          return { actionCreator: 'doResolvePeerLocation', args: [peer] }
        }
      }
    ),

    // When the peers list changes, queue up the peers we don't already know about
    reactQueuePeerLocations: createSelector(
      'selectPeers',
      'selectPeerLocationsRaw',
      (peers, peerLocationsRaw) => {
        peers = (peers || [])
          .filter(p => !peerLocationsRaw[p.peer.toB58String()])
          .filter(p => p.addr.stringTuples().some(isNonHomeIPv4))

        if (peers.length) {
          return { type: 'PEER_LOCATIONS_PEERS_QUEUED', payload: { peers } }
        }
      }
    )
  }
}

const isNonHomeIPv4 = (t) => t[0] === 4 && t[1] !== '127.0.0.1'

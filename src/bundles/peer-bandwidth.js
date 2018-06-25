import { createSelector } from 'redux-bundler'

// Depends on ipfsBundle, peersBundle
export default function (opts) {
  opts = opts || {}
  // Max number of peers to update at once
  opts.peerUpdateConcurrency = opts.peerUpdateConcurrency || 5
  // The minimum time between ticks.
  //
  // When all peers have up to date bandwidth stats, ticks cause this bundle to
  // check periodically if they're still all up to date and start updating any
  // out of date peers. If set to 0 then the check will happen every time any
  // action is dispatched. If set to 1000 then the check will happen when an
  // action is dispatched 1 second after the last tick.
  //
  // This implies a loose dependency on an idle action dispatcher that'll fire
  // if no other actions are fired within a certain time period. e.g. the
  // APP_IDLE action that is dispatched from the reactor bundle.
  opts.tickResolution = opts.tickResolution || 1000
  // The minimum time between updates for each peer
  opts.peerUpdateInterval = opts.peerUpdateInterval || 5000
  // Inactive peers are de-prioritised
  opts.inactivePeerUpdateInterval = opts.inactivePeerUpdateInterval || 30000

  return {
    name: 'peerBandwidth',

    reducer (state = { peers: [], updatingPeerIds: [], now: Date.now() }, action) {
      if (action.type === 'PEER_BANDWIDTH_PEERS_CHANGED') {
        const { added, removed } = action.payload
        return {
          ...state,
          now: Date.now(), // If the peers changed we need to start processing them
          peers: state.peers
            .filter(({ id }) => !removed.includes(id))
            .concat(added.map(peerId => ({ id: peerId })))
        }
      }

      if (action.type === 'UPDATE_PEER_BANDWIDTH_STARTED') {
        return {
          ...state,
          now: Date.now(), // Pick up another peer if possible
          updatingPeerIds: state.updatingPeerIds.concat(action.payload.peerId)
        }
      }

      if (action.type === 'UPDATE_PEER_BANDWIDTH_FINISHED') {
        return {
          ...state,
          now: Date.now(), // Pick up another peer if possible
          peers: state.peers.map(p => {
            if (p.id !== action.payload.peerId) return p
            return {
              id: action.payload.peerId,
              bw: action.payload.bw,
              lastSuccess: Date.now()
            }
          }),
          updatingPeerIds: state.updatingPeerIds.filter(id => id !== action.payload.peerId)
        }
      }

      if (action.type === 'UPDATE_PEER_BANDWIDTH_FAILED') {
        return {
          ...state,
          now: Date.now(), // Pick up another peer if possible
          peers: state.peers.map(p => {
            if (p.id !== action.payload.peerId) return p
            return {
              id: action.payload.peerId,
              bw: p.bw,
              lastSuccess: p.lastSuccess,
              lastFailure: Date.now()
            }
          }),
          updatingPeerIds: state.updatingPeerIds.filter(id => id !== action.payload.peerId)
        }
      }

      // For all other actions, only update 'now' if we've exceeded the
      // minimum tick resolution
      return Date.now() - state.now > opts.tickResolution
        ? { ...state, now: Date.now() }
        : state
    },

    selectPeerBandwidthNow: state => state.peerBandwidth.now,
    selectPeerBandwidthUpdatingPeerIds: state => state.peerBandwidth.updatingPeerIds,
    selectPeerBandwidthPeers: state => state.peerBandwidth.peers,

    // Select the next peer to update from the list of peers we know about, only
    // if we're not already updating the maximum number of peers we're allowed to
    // update at once, and only if there is a peer that is ready to be updated
    // (enough time has elapsed since last update).
    selectNextPeerIdForUpdate: createSelector(
      'selectPeerBandwidthNow',
      'selectPeerBandwidthPeers',
      'selectPeerBandwidthUpdatingPeerIds',
      (now, peers, updatingPeerIds) => {
        if (!peers.length || updatingPeerIds.length >= opts.peerUpdateConcurrency) {
          return null
        }

        const lastAttempt = p => Math.max(p.lastSuccess || 0, p.lastFailure || 0)
        const isInactive = p => p.bw ? p.bw.rateIn.eq(0) && p.bw.rateOut.eq(0) : false
        const peerUpdateInterval = p => isInactive(p)
          ? opts.inactivePeerUpdateInterval
          : opts.peerUpdateInterval
        const isTimeToUpdate = p => lastAttempt(p) + peerUpdateInterval(p) < now
        const isNotAlreadyUpdating = p => !updatingPeerIds.includes(p.id)

        const peer = peers
          .filter(isTimeToUpdate)
          .sort((a, b) => lastAttempt(b) - lastAttempt(a))
          .filter(isNotAlreadyUpdating)[0]

        return peer ? peer.id : null
      }
    ),

    // Get updated bandwidth for a particular peer
    doUpdatePeerBandwidth: peerId => async ({ dispatch, getState, getIpfs }) => {
      dispatch({ type: 'UPDATE_PEER_BANDWIDTH_STARTED', payload: { peerId } })

      const ipfs = getIpfs()
      let bw

      try {
        bw = await ipfs.stats.bw({ peer: peerId })
      } catch (err) {
        return dispatch({
          type: 'UPDATE_PEER_BANDWIDTH_FAILED',
          payload: { peerId, error: err }
        })
      }

      dispatch({ type: 'UPDATE_PEER_BANDWIDTH_FINISHED', payload: { peerId, bw } })
    },

    reactUpdatePeerBandwidth: createSelector(
      'selectIpfsReady',
      'selectNextPeerIdForUpdate',
      (ipfsReady, peerId) => {
        if (ipfsReady && peerId) {
          return { actionCreator: 'doUpdatePeerBandwidth', args: [peerId] }
        }
      }
    ),

    reactSyncPeers: createSelector(
      'selectPeers',
      'selectPeerBandwidthPeers',
      (peers, bwPeers) => {
        const peerIds = (peers || []).reduce((ids, p) => {
          const id = p.peer.toB58String()
          if (ids.seen[id]) return ids
          ids.seen[id] = true
          ids.unique.push(id)
          return ids
        }, { seen: {}, unique: [] }).unique

        const added = peerIds.filter(id => !bwPeers.some(p => p.id === id))
        const removed = bwPeers.filter(p => peerIds.every(id => id !== p.id)).map(p => p.id)

        if (added.length || removed.length) {
          return { type: 'PEER_BANDWIDTH_PEERS_CHANGED', payload: { added, removed } }
        }
      }
    )
  }
}

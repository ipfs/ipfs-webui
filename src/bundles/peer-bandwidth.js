import { createSelector } from 'redux-bundler'

const CONCURRENCY = 5
const INTERVAL = 5000

export default {
  name: 'peerBandwidth',

  reducer (state = { peers: [], updatingPeers: [] }, action) {
    if (action.type === 'PEER_BANDWIDTH_PEER_ADDED') {
      return {
        ...state,
        peers: state.peers.concat({ id: action.payload.peerId, lastSuccess: -1 })
      }
    }

    if (action.type === 'PEER_BANDWIDTH_PEER_REMOVED') {
      return {
        ...state,
        peers: state.peers.filter(({ id }) => id !== action.payload.peerId)
      }
    }

    if (action.type === 'UPDATE_PEER_BANDWIDTH_STARTED') {
      return {
        ...state,
        updatingPeers: state.updatingPeers.concat(action.payload)
      }
    }

    if (action.type === 'UPDATE_PEER_BANDWIDTH_FINISHED') {
      return {
        ...state,
        peers: state.peers.map(p => {
          if (p.id !== action.payload.peerId) return p
          return {
            id: action.payload.peerId,
            bw: action.payload.bw,
            lastSuccess: Date.now()
          }
        }),
        updatingPeers: state.updatingPeers.filter(p => p.peerId !== action.payload.peerId)
      }
    }

    if (action.type === 'UPDATE_PEER_BANDWIDTH_FAILED') {
      return {
        ...state,
        peers: state.peers.map(p => {
          if (p.id !== action.payload.peerId) return p
          return {
            id: action.payload.peerId,
            bw: p.bw,
            lastSuccess: p.lastSuccess,
            lastFailure: Date.now()
          }
        }),
        updatingPeers: state.updatingPeers.filter(p => p.peerId !== action.payload.peerId)
      }
    }
  },

  selectPeerBandwidthUpdatingPeers: state => state.peerBandwidth.updatingPeers,
  selectPeerBandwidthPeers: state => state.peerBandwidth.peers,

  // Select the next peer to update from the list of peers we know about, only
  // if we're not already updating the maximum number of peers we're allowed to
  // update at once, and only if there is a peer that is ready to be updated
  // (enough time has elapsed since last update).
  selectNextPeerForUpdate: createSelector(
    'selectPeerBandwidthPeers',
    'selectPeerBandwidthUpdatingPeers',
    (peers, updatingPeers) => {
      if (peers.length > 0 && updatingPeers.length < CONCURRENCY) {
        const now = Date.now()
        // TODO: select most out of date?
        const peer = peers.find(({ lastSuccess, lastFailure }) => {
          const lastAttempt = Math.max(lastSuccess, lastFailure)
          return lastAttempt + INTERVAL < now
        })
        return peer ? peer.id : null
      }
      return null
    }
  ),

  // Get updated bandwidth for a particular peer
  doUpdatePeerBandwidth: peerId => async ({ dispatch, getState, getIpfs }) => {
    dispatch({ type: 'UPDATE_PEER_BANDWIDTH_STARTED', payload: { peerId } })

    const { ipfs } = getIpfs()
    let bw

    try {
      bw = await ipfs.stats.bw({ peer: peerId })
    } catch (err) {
      return dispatch({
        type: 'UPDATE_PEER_BANDWIDTH_FAILED',
        payload: { peerId, error: err }
      })
    }

    dispatch({
      type: 'UPDATE_PEER_BANDWIDTH_FINISHED',
      payload: { peerId, bw }
    })
  },

  // Add or remove peers from the list of peers we know about
  doSyncPeers: ({ added, removed }) => ({ dispatch }) => {
    added.forEach(peerId => {
      dispatch({ type: 'PEER_BANDWIDTH_PEER_ADDED', payload: { peerId } })
    })

    removed.forEach(peerId => {
      dispatch({ type: 'PEER_BANDWIDTH_PEER_REMOVED', payload: { peerId } })
    })
  },

  reactUpdatePeerBandwidth: createSelector(
    'selectIpfsReady',
    'selectNextPeerForUpdate',
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
      const peerIds = peers.map(p => {
        return p.peer.toB58String ? p.peer.toB58String() : p.peer.id.toB58String()
      })

      const added = peerIds.filter(id => !bwPeers.some(p => p.id === id))

      const removed = bwPeers.filter(p => {
        return peerIds.every(id => id !== p.id)
      }).map(p => p.id)

      if (added.length || removed.length) {
        return { actionCreator: 'doSyncPeers', args: [{ added, removed }] }
      }
    }
  )
}

import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'
import { multiaddr } from '@multiformats/multiaddr'

const swarmPeersTTL = ms.seconds(10)
const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers({ verbose: true, timeout: swarmPeersTTL }),
  staleAfter: swarmPeersTTL,
  persist: false,
  checkIfOnline: false
})

const asyncResourceReducer = bundle.reducer

bundle.reducer = (state, action) => {
  const asyncResult = asyncResourceReducer(state, action)

  if (action.type === 'SET_SELECTED_PEER') {
    return { ...asyncResult, selectedPeers: action.payload }
  }

  return asyncResult
}

bundle.selectPeersCount = createSelector(
  'selectPeers',
  (peers) => {
    if (!Array.isArray(peers)) return 0
    return peers.length
  }
)

bundle.doConnectSwarm = (addr, permanent) => async ({ dispatch, getIpfs, store }) => {
  dispatch({ type: 'SWARM_CONNECT_STARTED', payload: { addr } })
  const ipfs = getIpfs()

  try {
    await ipfs.swarm.connect(addr)

    if (permanent) {
      const maddr = multiaddr(addr)
      const peerId = maddr.getPeerId()
      const rawAddr = maddr.decapsulateCode(421).toString() // drop /p2p suffix

      // TODO: switch to ipfs.swarm.peering when https://github.com/ipfs/kubo/pull/8147 ships
      let peers = (await ipfs.config.get('Peering.Peers')) || []
      const preexisting = peers.find(p => p.ID === peerId)
      if (preexisting) {
        if (!preexisting.Addrs.find(a => a === rawAddr)) {
          // add new addr to existing address list for the peer
          preexisting.Addrs.push(rawAddr)
        }
      } else {
        // add new peer to the list
        peers = [...peers, { ID: peerId, Addrs: [rawAddr] }]
      }

      await ipfs.config.set('Peering.Peers', peers)
      await store.doMarkConfigAsOutdated() // force Settings screen to re-fetch
    }
  } catch (err) {
    return dispatch({
      type: 'SWARM_CONNECT_FAILED',
      payload: { addr, error: err }
    })
  }

  return dispatch({ type: 'SWARM_CONNECT_FINISHED', payload: { addr } })
}

// Update the peers if they are stale (appTime - lastSuccess > staleAfter)
bundle.reactPeersFetchWhenIdle = createSelector(
  'selectPeersShouldUpdate',
  'selectIpfsConnected',
  (shouldUpdate, ipfsConnected) => {
    if (shouldUpdate && ipfsConnected) {
      return { actionCreator: 'doFetchPeers' }
    }
  }
)

// Get the peers frequently when we're on the peers page
bundle.reactPeersFetchWhenActive = createSelector(
  'selectAppTime',
  'selectRouteInfo',
  'selectPeersRaw',
  'selectIpfsConnected',
  (appTime, routeInfo, peersInfo, selectIpfsReady, ipfsConnected) => {
    const lastSuccess = peersInfo.lastSuccess || 0
    if (routeInfo.url === '/peers' && ipfsConnected && !peersInfo.isLoading && appTime - lastSuccess > ms.seconds(5)) {
      return { actionCreator: 'doFetchPeers' }
    }
  }
)

bundle.selectSelectedPeers = (state) => state.peers.selectedPeers

bundle.doSetSelectedPeers = (peer) => ({ dispatch }) => {
  dispatch({ type: 'SET_SELECTED_PEER', payload: peer })
}

export default bundle

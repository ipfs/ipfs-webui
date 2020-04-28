import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'

const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers({ verbose: true }),
  staleAfter: ms.seconds(10),
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

bundle.doConnectSwarm = addr => async ({ dispatch, getIpfs }) => {
  dispatch({ type: 'SWARM_CONNECT_STARTED', payload: { addr } })
  const ipfs = getIpfs()

  try {
    await ipfs.swarm.connect(addr)
  } catch (err) {
    return dispatch({
      type: 'SWARM_CONNECT_FAILED',
      payload: { addr, error: err }
    })
  }

  dispatch({ type: 'SWARM_CONNECT_FINISHED', payload: { addr } })
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

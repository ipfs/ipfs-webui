import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'

const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers(),
  staleAfter: ms.seconds(10),
  checkIfOnline: false
})

bundle.selectTableData = state => {
  const peers = state.peers.data

  return peers && peers.map((peer, idx) => ({
    'id': peer.peer.toB58String(),
    'address': peer.addr.toString(),
    'location': 'New York, United States'
  }))
}

// Update the peers if they are stale (appTime - lastSuccess > staleAfter)
bundle.reactPeersFetchWhenIdle = createSelector(
  'selectPeersShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchPeers' }
    }
  }
)

// Get the peers frequently when we're on the peers page
bundle.reactPeersFetchWhenActive = createSelector(
  'selectAppTime',
  'selectRouteInfo',
  'selectPeersRaw',
  'selectIpfsReady',
  (appTime, routeInfo, peersInfo, ipfsReady) => {
    const lastSuccess = peersInfo.lastSuccess || 0
    if (routeInfo.url === '/peers' && ipfsReady && appTime - lastSuccess > ms.seconds(2)) {
      return { actionCreator: 'doFetchPeers' }
    }
  }
)

export default bundle

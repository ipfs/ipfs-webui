import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'

const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers(),
  staleAfter: ms.seconds(10),
  persist: false,
  checkIfOnline: false
})

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

export default bundle

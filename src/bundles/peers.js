import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'

const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers()
    .then((peers) => peers.sort((a, b) => {
      const aAddr = a.addr.toString()
      const bAddr = b.addr.toString()
      return aAddr.localeCompare(bAddr, undefined, { numeric: true, sensitivity: 'base' })
    })),
  staleAfter: ms.seconds(10),
  persist: false,
  checkIfOnline: false
})

bundle.selectPeersCount = createSelector(
  'selectPeers',
  (peers) => {
    if (!Array.isArray(peers)) return 0
    return peers.length
  }
)

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

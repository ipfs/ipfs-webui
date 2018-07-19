import { createAsyncResourceBundle, createSelector } from 'redux-bundler'
import ms from 'milliseconds'

const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers(),
  staleAfter: ms.seconds(10),
  checkIfOnline: false
})

bundle.selectTableData = createSelector(
  'selectPeers',
  'selectPeerLocations',
  (peers, locations) => peers && peers.map((peer, idx) => {
    const peerId = peer.peer.toB58String()
    const peerAddress = peer.addr.toString()
    const peerLocationObj = locations[peerId]
    const peerCountry = peerLocationObj && peerLocationObj.country_name
    const peerCity = peerLocationObj && peerLocationObj.city
    const peerFlagCode = peerLocationObj && peerLocationObj.country_code

    let peerLocation = ''
    if (peerCity && peerCountry) {
      peerLocation = `${peerCity}, ${peerCountry}`
    } else if (peerCountry) {
      peerLocation = peerCountry
    }

    return {
      'id': peerId,
      'address': peerAddress,
      'location': peerLocation,
      'flagCode': peerFlagCode
    }
  })
)

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

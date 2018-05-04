import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'peers',
  actionBaseType: 'PEERS',
  getPromise: ({ getIpfs }) => getIpfs().swarm.peers(),
  staleAfter: 5000,
  checkIfOnline: false
})

bundle.init = store => {
  setInterval(() => store.dispatch({ type: 'PEERS_POLL' }), 1000)
}

bundle.reactPeersFetch = createSelector(
  'selectPeersShouldUpdate',
  'selectIpfsReady',
  (shouldUpdate, ipfsReady) => {
    if (shouldUpdate && ipfsReady) {
      return { actionCreator: 'doFetchPeers' }
    }
  }
)

export default bundle

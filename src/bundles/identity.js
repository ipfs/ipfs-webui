import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'identity',
  actionBaseType: 'IDENTITY',
  getPromise: ({ getIpfs }) => getIpfs().id(),
  staleAfter: Infinity,
  persist: false,
  checkIfOnline: false
})

bundle.selectIdentityLastSuccess = state => state.identity.lastSuccess

// Update identity after we (re)connect with ipfs
bundle.reactIdentityFetch = createSelector(
  'selectIpfsConnected',
  'selectIdentityIsLoading',
  'selectIdentityLastSuccess',
  'selectConnectedLastError',
  (connected, isLoading, idLastSuccess, connLastError) => {
    console.log('reactIdentityFetch', { connected, isLoading, connLastError, idLastSuccess })
    if (connected && !isLoading) {
      if (!idLastSuccess || connLastError > idLastSuccess) {
        return { actionCreator: 'doFetchIdentity' }
      }
    }
  }
)

export default bundle

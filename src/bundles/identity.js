import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

// Matches APP_IDLE and peer bandwidth update intervals
export const IDENTITY_REFRESH_INTERVAL_MS = 5000

const bundle = createAsyncResourceBundle({
  name: 'identity',
  actionBaseType: 'IDENTITY',
  getPromise: ({ getIpfs }) => getIpfs().id().catch((err) => {
    console.error('Failed to get identity', err)
  }),
  staleAfter: IDENTITY_REFRESH_INTERVAL_MS,
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
    if (connected && !isLoading) {
      if (!idLastSuccess || connLastError > idLastSuccess) {
        return { actionCreator: 'doFetchIdentity' }
      }
    }
  }
)

export default bundle

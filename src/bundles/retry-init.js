import { createSelector } from 'redux-bundler'

// We ask for the stats every few seconds, so that gives a good indication
// that ipfs things are working (or not), without additional polling of the api.
const retryInit = {
  name: 'retryInit',

  reducer: (state = {}, action) => {
    if (action.type === 'IPFS_INIT_STARTED') {
      return { ...state, startedAt: Date.now() }
    }
    if (action.type === 'IPFS_INIT_FAILED') {
      return { ...state, failedAt: Date.now() }
    }
    return state
  },

  selectInitStartedAt: state => state.retryInit.startedAt,

  selectInitFailedAt: state => state.retryInit.failedAt,

  reactConnectionInitRetry: createSelector(
    'selectAppTime',
    'selectInitStartedAt',
    'selectInitFailedAt',
    (appTime, startedAt, failedAt) => {
      if (!failedAt || failedAt < startedAt) return false
      if (appTime - failedAt < 3000) return false
      return { actionCreator: 'doInitIpfs' }
    }
  )
}

export default retryInit

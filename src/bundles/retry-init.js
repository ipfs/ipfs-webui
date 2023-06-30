import { createSelector } from 'redux-bundler'
import { ACTIONS } from './ipfs-provider.js'

/**
 *
 * @typedef {Object} AppIdle
 * @property {'APP_IDLE'} type
 *
 * @typedef {Object} DisableRetryInit
 * @property {'RETRY_INIT_DISABLE'} type
 *
 * @typedef {import('./ipfs-provider').Message | AppIdle | DisableRetryInit} Message
 *
 * @typedef {Object} Model
 * @property {number} [startedAt]
 * @property {number} [failedAt]
 * @property {number} [tryCount]
 * @property {boolean} [needToRetry]
 * @property {number} [intervalId]
 * @property {boolean} currentlyTrying
 *
 * @typedef {Object} State
 * @property {Model} retryInit
 *
 */

const retryTime = 2500
const maxRetries = 5

/**
 * @returns {Model}
 */
const initialState = () => ({ tryCount: 0, needToRetry: true, startedAt: undefined, failedAt: undefined, currentlyTrying: false })

/**
 * @returns {Model}
 */
const disabledState = () => {
  return ({ ...initialState(), needToRetry: false })
}

// We ask for the stats every few seconds, so that gives a good indication
// that ipfs things are working (or not), without additional polling of the api.

const retryInit = {
  name: 'retryInit',

  /**
   * @param {Model} state
   * @param {Message} action
   * @returns {Model}
   */
  reducer: (state = initialState(), action) => {
    switch (action.type) {
      case 'RETRY_INIT_DISABLE': {
        return disabledState()
      }
      case ACTIONS.IPFS_INIT: {
        const { task } = action
        switch (task.status) {
          case 'Init': {
            const startedAt = Date.now()
            return {
              ...state,
              currentlyTrying: true,
              startedAt, // new init attempt, set startedAt
              tryCount: (state.tryCount || 0) + 1 // increase tryCount
            }
          }
          case 'Exit': {
            if (task.result.ok) {
              // things are okay, reset the state
              return disabledState()
            } else {
              const failedAt = Date.now()
              return { ...state, failedAt, currentlyTrying: false }
            }
          }
          default: {
            return state
          }
        }
      }
      default: {
        return state
      }
    }
  },

  /**
   * @returns {(context: import('redux-bundler').Context<Model, Message, unknown>) => void}
   */
  doDisableRetryInit: () => (context) => {
    // we should emit IPFS_INIT_FAILED at this point
    context.dispatch({
      type: 'RETRY_INIT_DISABLE'
    })
  },

  /**
   * @param {State} state
   */
  selectRetryInitState: state => state.retryInit,

  /**
   * This is continuously called by the app
   * @see https://reduxbundler.com/api-reference/bundle#bundle.reactx
   */
  reactConnectionInitRetry: createSelector(
    'selectAppTime', // this is the current time of the app.. we need this to compare against startedAt
    'selectIpfsReady',
    'selectRetryInitState',
    /**
     * @param {number|void} appTime
     * @param {boolean} ipfsReady
     * @param {Model} state
     */
    (appTime, ipfsReady, { failedAt, tryCount, needToRetry, currentlyTrying }) => {
      if (currentlyTrying) return false // if we are currently trying, don't try again
      if (!appTime) return false // This should never happen; see https://reduxbundler.com/api-reference/included-bundles#apptimebundle
      if (!needToRetry) return false // we should not be retrying, so don't.
      if (tryCount != null && tryCount > maxRetries) return { actionCreator: 'doDisableRetryInit' }
      if (ipfsReady) return { actionCreator: 'doDisableRetryInit' } // when IPFS is ready, we don't need to retry
      if (!failedAt || appTime - failedAt < retryTime) return false
      return { actionCreator: 'doTryInitIpfs' }
    }
  )
}

export default retryInit

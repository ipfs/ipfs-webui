import { createSelector } from 'redux-bundler'
import { ACTIONS as EXP_ACTIONS } from './experiments.js'
import { ACTIONS as FILES_ACTIONS } from './files/index.js'

/*
# Notify
- show error when ipfs goes away.
- show ok when it comes back.
- dismiss the ok after 3s
*/

const defaultState = {
  show: false,
  error: false,
  eventId: null,
  code: null
}

const notify = {
  name: 'notify',

  reducer: (state = defaultState, action) => {
    if (action.type === 'NOTIFY_DISMISSED') {
      return { ...state, show: false }
    }

    if (action.type === 'STATS_FETCH_FAILED') {
      return {
        ...state,
        show: true,
        error: true,
        eventId: action.type
      }
    }

    if (action.type.match(/^FILES_\w+_FAILED$/)) {
      return {
        ...state,
        show: true,
        error: true,
        eventId: 'FILES_EVENT_FAILED',
        code: action.payload.error.code
      }
    }

    if (action.type === 'STATS_FETCH_FINISHED' && state.eventId === 'STATS_FETCH_FAILED') {
      return {
        ...state,
        error: false,
        eventId: 'STATS_FETCH_FINISHED',
        lastSuccess: Date.now()
      }
    }

    if (action.type === 'SWARM_CONNECT_FAILED' || action.type === 'SWARM_CONNECT_FINISHED') {
      return {
        ...state,
        show: true,
        error: action.type === 'SWARM_CONNECT_FAILED',
        eventId: action.type
      }
    }

    if (action.type === EXP_ACTIONS.EXP_TOGGLE_FAILED) {
      return {
        ...state,
        show: true,
        error: true,
        eventId: `experimentsErrors.${action.payload.key}`
      }
    }

    if (action.type === 'IPFS_PIN_FAILED') {
      return {
        ...state,
        show: true,
        error: true,
        msgArgs: action.msgArgs,
        eventId: action.type
      }
    }

    if (action.type === 'IPFS_PIN_SUCCEED') {
      return {
        ...state,
        show: true,
        error: false,
        msgArgs: action.msgArgs,
        eventId: action.type
      }
    }

    if (action.type === 'IPFS_UNPIN_SUCCEED') {
      return {
        ...state,
        show: true,
        error: false,
        msgArgs: action.msgArgs,
        eventId: action.type
      }
    }

    if (action.type === 'IPFS_CONNECT_FAILED') {
      return {
        ...state,
        show: true,
        error: true,
        eventId: action.type
      }
    }

    if (action.type === 'IPFS_CONNECT_SUCCEED') {
      return {
        ...state,
        show: true,
        error: false,
        eventId: action.type
      }
    }

    if (action.type === 'IPFS_API_ADDRESS_INVALID') {
      return {
        ...state,
        show: true,
        error: true,
        eventId: action.type
      }
    }

    return state
  },

  selectNotify: state => state.notify,

  selectNotifyI18nKey: createSelector(
    'selectNotify',
    'selectIpfsProvider',
    (notify, provider) => {
      const { eventId, code } = notify

      if (eventId === 'STATS_FETCH_FAILED') {
        return 'ipfsApiRequestFailed'
      }
      if (eventId === 'IPFS_CONNECT_FAILED') {
        return 'ipfsConnectFail'
      }
      if (eventId === 'IPFS_CONNECT_SUCCEED') {
        return 'ipfsConnectSuccess'
      }
      if (eventId === 'IPFS_API_ADDRESS_INVALID') {
        return 'ipfsInvalidApiAddress'
      }
      if (eventId === 'IPFS_PIN_FAILED') {
        return 'ipfsPinFailReason'
      }
      if (eventId === 'IPFS_PIN_SUCCEED') {
        return 'ipfsPinSucceedReason'
      }
      if (eventId === 'IPFS_UNPIN_SUCCEED') {
        return 'ipfsUnpinSucceedReason'
      }

      if (eventId === 'FILES_EVENT_FAILED') {
        const type = code ? code.replace(/^(ERR_)/, '') : ''

        switch (type) {
          case 'FOLDER_EXISTS':
            return 'folderExists'
          case FILES_ACTIONS.WRITE:
          case FILES_ACTIONS.ADD_BY_PATH:
          case 'API_RESPONSE':
            return 'filesAddFailed'
          case FILES_ACTIONS.FETCH:
            return 'filesFetchFailed'
          case FILES_ACTIONS.MOVE:
            return 'filesRenameFailed'
          case FILES_ACTIONS.MAKE_DIR:
            return 'filesMakeDirFailed'
          case FILES_ACTIONS.COPY:
            return 'filesCopyFailed'
          case FILES_ACTIONS.DELETE:
            return 'filesRemoveFailed'
          default:
            return 'filesEventFailed'
        }
      }

      if (eventId === 'STATS_FETCH_FINISHED') {
        return 'ipfsIsBack'
      }

      if (eventId === 'SWARM_CONNECT_FAILED') {
        return 'couldntConnectToPeer'
      }

      if (eventId === 'SWARM_CONNECT_FINISHED') {
        return 'connectedToPeer'
      }

      return eventId
    }
  ),

  doNotifyDismiss: () => ({ dispatch }) => dispatch({ type: 'NOTIFY_DISMISSED' }),

  // Dismiss the "all ok" message after 3 seconds
  reactNotifyOkDismiss: createSelector(
    'selectAppTime',
    'selectNotify',
    (appTime, notify) => {
      if (notify.eventId === 'STATS_FETCH_FINISHED' && notify.show && appTime - notify.lastSuccess > 3000) {
        return { type: 'NOTIFY_DISMISSED' }
      }
    }
  )
}

export default notify

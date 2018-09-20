import { createSelector } from 'redux-bundler'

/*
# Notify
- show error when ipfs goes away.
- show ok when it comes back.
- dismiss the the ok after 2s
*/

const defaultState = {
  show: false,
  error: false,
  eventId: null
}

const notify = {
  name: 'notify',

  reducer: (state = defaultState, action) => {
    if (action.type === 'NOTIFY_DISMISSED') {
      return { ...state, show: false }
    }

    if (action.type.match(/_FETCH_FAILED$/) || action.type.match(/^FILE_\w+_FAILED$/)) {
      if (action.type === 'CONFIG_FETCH_FAILED') {
        // TODO: this avoids flashing the error message when booting with window.ipfs, but it's very loose.
        return state
      }
      if (state.eventId !== 'FETCH_FAILED') {
        return {
          ...state,
          show: true,
          error: true,
          eventId: 'FETCH_FAILED'
        }
      }
    }

    if (action.type.match(/_FETCH_FINISHED$/) || action.type.match(/^FILE_\w+_FINISHED$/)) {
      // Finsihing with an error is not a good finish.
      // TODO: fix explore bundle to not do that.
      if (action.payload && action.payload.error) return state
      if (state.eventId === 'FETCH_FAILED') {
        return {
          ...state,
          error: false,
          eventId: 'FETCH_FINISHED',
          lastSuccess: Date.now()
        }
      }
    }

    return state
  },

  selectNotify: state => state.notify,

  selectNotifyI18nKey: createSelector(
    'selectNotify',
    'selectIpfsProvider',
    (notify, provider) => {
      const { eventId } = notify

      if (eventId === 'FETCH_FAILED') {
        if (provider === 'window.ipfs') {
          return 'windowIpfsRequestFailed'
        }
        return 'ipfsApiRequestFailed'
      }

      if (eventId === 'FETCH_FINISHED') {
        return 'ipfsIsBack'
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
      if (notify.eventId === 'FETCH_FINISHED' && notify.show && appTime - notify.lastSuccess > 3000) {
        return { type: 'NOTIFY_DISMISSED' }
      }
    }
  )
}

export default notify

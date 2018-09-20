import { createSelector } from 'redux-bundler'
import i18n from '../i18n'

/*
# Notify
- show error when ipfs goes away.
- show ok when it comes back.
- dismiss the the ok after 2s
*/

const defaultState = {
  show: false,
  error: false,
  contentId: null
}

const notify = {
  name: 'notify',

  reducer: (state = defaultState, action) => {
    if (action.type === 'NOTIFY_DISMISSED') {
      return { ...state, show: false }
    }

    if (action.type.match(/_FETCH_FAILED$/)) {
      if (action.type === 'CONFIG_FETCH_FAILED') {
        // TODO: this avoids flashing the error message when booting with window.ipfs, but it's very loose.
        return state
      }
      if (state.contentId !== 'FETCH_FAILED') {
        return {
          ...state,
          show: true,
          error: true,
          contentId: 'FETCH_FAILED'
        }
      }
    }

    if (action.type.match(/_FETCH_FINISHED$/)) {
      if (action.payload && action.payload.error) return state
      if (state.contentId === 'FETCH_FAILED') {
        return {
          ...state,
          error: false,
          contentId: 'FETCH_FINISHED',
          lastSuccess: Date.now()
        }
      }
    }

    return state
  },

  selectNotify: state => state.notify,

  selectNotifyContent: state => {
    const { contentId } = state.notify
    const provider = (state.ipfs && state.ipfs.provider) || 'js-ipfs-api'

    if (contentId === 'FETCH_FAILED') {
      if (provider === 'window.ipfs') {
        return i18n.t('notify:windowIpfsRequestFailed')
      }
      return i18n.t('notify:ipfsApiRequestFailed')
    }

    if (contentId === 'FETCH_FINISHED') {
      return i18n.t('notify:ipfsIsBack')
    }

    return contentId
  },

  doNotifyDismiss: () => ({ dispatch }) => dispatch({ type: 'NOTIFY_DISMISSED' }),

  // Dismiss the "all ok" message after 3 seconds
  reactNotifyOkDismiss: createSelector(
    'selectAppTime',
    'selectNotify',
    (appTime, notify) => {
      if (notify.contentId === 'FETCH_FINISHED' && notify.show && appTime - notify.lastSuccess > 3000) {
        return { type: 'NOTIFY_DISMISSED' }
      }
    }
  )
}

export default notify

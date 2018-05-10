function startInterval (store) {
  store.liveUpdateInterval = setInterval(() => store.dispatch({ type: 'UPDATE' }), 1000)
}

export default {
  name: 'liveUpdate',

  reducer (state = true, action) {
    if (action.type === 'TOGGLED_LIVE_UDPATE') {
      return !state
    }
    return state
  },

  init: (store) => {
    startInterval(store)
  },

  selectLiveUpdate: state => state.liveUpdate,

  doToggleLiveUpdate: () => ({ dispatch, store, getState }) => {
    const liveUpdate = getState().liveUpdate
    if (liveUpdate) {
      clearInterval(store.liveUpdateInterval)
    } else {
      startInterval(store)
    }
    dispatch({ type: 'TOGGLED_LIVE_UDPATE' })
  }
}

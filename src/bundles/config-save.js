const bundle = {
  name: 'config_save',

  reducer: (state = { isSaving: false }, action) => {
    if (action.type === 'CONFIG_SAVE_STARTED') {
      return { ...state, isSaving: true }
    }
    if (action.type === 'CONFIG_SAVE_FINISHED') {
      return { ...state, isSaving: false, lastSuccess: Date.now() }
    }
    if (action.type === 'CONFIG_SAVE_FAILED') {
      const { error } = action
      const errorMessage = (error && error.message) || error
      return { ...state, isSaving: false, lastError: Date.now(), errorMessage }
    }
    return state
  },

  selectConfigIsSaving: state => state.config_save.isSaving,
  selectConfigSaveLastSuccess: state => state.config_save.lastSuccess,
  selectConfigSaveLastError: state => state.config_save.lastError,

  doSaveConfig: (configStr) => async ({ dispatch, getIpfs, store }) => {
    if (store.selectConfigIsSaving()) {
      return console.log('doSaveConfig skipped, config save already in progress')
    }
    dispatch({ type: 'CONFIG_SAVE_STARTED' })
    try {
      const obj = JSON.parse(configStr)
      await getIpfs().config.replace(obj)
    } catch (err) {
      return dispatch({ type: 'CONFIG_SAVE_FAILED', error: err })
    }
    await store.doMarkConfigAsOutdated()
    dispatch({ type: 'CONFIG_SAVE_FINISHED' })

    if (store.selectIsIpfsDesktop()) {
      store.doDesktopIpfsConfigChanged()
    }
  }
}

export default bundle

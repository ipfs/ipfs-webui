let bundle = {
  name: 'ipfsDesktop',
  reducer: (state = {}) => state,
  selectIsIpfsDesktop: () => !!window.ipfsDesktop
}

if (window.ipfsDesktop) {
  bundle = {
    ...bundle,

    reducer: (state = {}, action) => {
      if (!action.type.startsWith('DESKTOP_')) {
        return state
      }

      if (action.type === 'DESKTOP_SETTINGS_CHANGED') {
        return action.payload
      }

      return state
    },

    selectDesktopSettings: state => state.ipfsDesktop,

    selectDesktopAvailableExperiments: () => window.ipfsDesktop.experiments,

    selectDesktopExperiments: state => state.ipfsDesktop.experiments,

    doDesktopStartListening: () => async ({ dispatch }) => {
      window.ipfsDesktop.onConfigChanged(config => {
        dispatch({
          type: 'DESKTOP_SETTINGS_CHANGED',
          payload: config
        })
      })
    },

    doDesktopSettingsToggle: (setting) => () => {
      window.ipfsDesktop.toggleSetting(setting)
    },

    doDesktopToggleExperiment: (id) => () => {
      window.ipfsDesktop.toggleSetting(`experiment.${id}`)
    },

    init: store => {
      store.doDesktopStartListening()
    }
  }
}

export default bundle

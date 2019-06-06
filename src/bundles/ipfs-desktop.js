import { ACTIONS } from './experiments'

let bundle = {
  name: 'ipfsDesktop',
  reducer: (state = {}) => state,
  selectIsIpfsDesktop: () => !!window.ipfsDesktop
}

if (window.ipfsDesktop) {
  bundle = {
    ...bundle,
    reducer: (state = {}, action) => {
      if (action.type === ACTIONS.EXP_TOGGLE) {
        const key = action.payload.key

        if (window.ipfsDesktop.experiments.includes(key)) {
          window.ipfsDesktop.toggleSetting(`experiments.${key}`)
        }
      }

      if (!action.type.startsWith('DESKTOP_')) {
        return state
      }

      if (action.type === 'DESKTOP_SETTINGS_CHANGED') {
        return action.payload
      }

      return state
    },

    selectDesktopSettings: state => state.ipfsDesktop,

    selectDesktopVersion: () => window.ipfsDesktop.version,

    doDesktopStartListening: () => async ({ dispatch, store }) => {
      window.ipfsDesktop.onConfigChanged(({ config, changed, success }) => {
        const prevConfig = store.selectDesktopSettings()

        if (Object.keys(prevConfig).length === 0) {
          dispatch({
            type: ACTIONS.EXP_UPDATE_STATE,
            payload: Object.keys(config.experiments).reduce(
              (all, key) => ({
                ...all,
                [key]: {
                  enabled: config.experiments[key]
                }
              }),
              {}
            )
          })
        }

        if (changed && changed.startsWith('experiments.')) {
          const key = changed.replace('experiments.', '')

          if (success) {
            dispatch({ type: ACTIONS.EXP_TOGGLE_SUCCESS, payload: { key } })
          } else {
            dispatch({ type: ACTIONS.EXP_TOGGLE_FAIL, payload: { key } })
          }
        }

        dispatch({
          type: 'DESKTOP_SETTINGS_CHANGED',
          payload: config
        })
      })
    },

    doDesktopSettingsToggle: (setting) => () => {
      window.ipfsDesktop.toggleSetting(setting)
    },

    doDesktopIpfsConfigChanged: () => () => {
      window.ipfsDesktop.configHasChanged()
    },

    doDesktopSelectDirectory: () => () => {
      return window.ipfsDesktop.selectDirectory()
    },

    init: store => {
      store.doDesktopStartListening()
    }
  }
}

export default bundle

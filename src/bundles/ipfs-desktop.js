import { ACTIONS as EXP_ACTIONS } from './experiments'

export const ACTIONS = {
  SETTING_TOGGLE_STARTED: 'DESKTOP_SETTING_TOGGLE_STARTED',
  SETTING_TOGGLE_FINISHED: 'DESKTOP_SETTING_TOGGLE_FINISHED',
  SETTING_TOGGLE_FAILED: 'DESKTOP_SETTING_TOGGLE_FAILED'
}

let bundle = {
  name: 'ipfsDesktop',
  reducer: (state = {}) => state,
  selectIsIpfsDesktop: () => !!window.ipfsDesktop,
  selectDesktopCountlyActions: () => ([])
}

if (window.ipfsDesktop) {
  bundle = {
    ...bundle,
    reducer: (state = {}, action) => {
      if (action.type === EXP_ACTIONS.EXP_TOGGLE_STARTED) {
        window.ipfsDesktop.toggleSetting(`experiments.${action.payload.key}`)
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

    selectDesktopPlatform: state => state.ipfsDesktop.platform,

    selectDesktopVersion: () => window.ipfsDesktop.version,

    selectDesktopCountlyDeviceId: () => window.ipfsDesktop.countlyDeviceId,

    selectDesktopCountlyActions: () => window.ipfsDesktop.countlyActions,

    doDesktopStartListening: () => async ({ dispatch, store }) => {
      window.ipfsDesktop.onConfigChanged(({ platform, config, changed, success }) => {
        const prevConfig = store.selectDesktopSettings()

        if (Object.keys(prevConfig).length === 0) {
          dispatch({
            type: EXP_ACTIONS.EXP_UPDATE_STATE,
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

        if (changed) {
          const isExperiment = changed.startsWith('experiments.')
          const key = isExperiment
            ? changed.replace('experiments.', '')
            : changed

          const type = isExperiment
            ? success
              ? EXP_ACTIONS.EXP_TOGGLE_FINISHED
              : EXP_ACTIONS.EXP_TOGGLE_FAILED
            : success
              ? ACTIONS.SETTING_TOGGLE_FINISHED
              : ACTIONS.SETTING_TOGGLE_FAILED

          const value = isExperiment
            ? config.experiments[key]
            : config[key]

          dispatch({ type, payload: { key, value } })
        }

        dispatch({
          type: 'DESKTOP_SETTINGS_CHANGED',
          payload: config ? { ...config, platform } : undefined
        })
      })
    },

    doDesktopSettingsToggle: setting => ({ dispatch }) => {
      dispatch({ type: ACTIONS.SETTING_TOGGLE_STARTED, payload: { key: setting } })
      window.ipfsDesktop.toggleSetting(setting)
    },

    doDesktopIpfsConfigChanged: () => () => {
      window.ipfsDesktop.configHasChanged()
    },

    doDesktopSelectDirectory: () => () => {
      return window.ipfsDesktop.selectDirectory()
    },

    doDesktopAddConsent: consent => () => {
      return window.ipfsDesktop.addConsent(consent)
    },

    doDesktopRemoveConsent: consent => () => {
      return window.ipfsDesktop.removeConsent(consent)
    },

    init: store => {
      store.doDesktopStartListening()
    }
  }
}

export default bundle

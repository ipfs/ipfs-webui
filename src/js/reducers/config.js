import {config as actions} from '../actions'
const {CONFIG} = actions

const configDefaultState = {
  config: {},
  draft: '',
  height: 0,
  saving: false,
  saved: false
}

export default function config (state = configDefaultState, action) {
  switch (action.type) {
    case CONFIG.SAVING_CONFIG:
      return {
        ...state,
        saving: action.saving
      }
    case CONFIG.SAVE_CONFIG:
      return {
        ...state,
        config: action.config
      }
    case CONFIG.INITIALIZE_CONFIG:
      return {
        ...state,
        config: action.config,
        draft: JSON.stringify(action.config, undefined, 2)
      }
    case CONFIG.SAVE_CONFIG_DRAFT:
      return {
        ...state,
        draft: action.draft
      }
    case CONFIG.SAVED_CONFIG:
      return {
        ...state,
        saved: action.saved
      }
    case CONFIG.RESET_CONFIG_DRAFT:
      return {
        ...state,
        draft: JSON.stringify(state.config, undefined, 2)
      }
    case CONFIG.LOAD.SUCCESS:
      return {
        ...state,
        config: action.response
      }
    default:
      return state
  }
}

import {config as actions} from '../actions'
const {CONFIG} = actions

const configDefaultState = {
  config: {}
}

export default function config (state = configDefaultState, action) {
  switch (action.type) {
    case CONFIG.LOAD.SUCCESS:
      return {
        ...state,
        config: action.response
      }
    default:
      return state
  }
}

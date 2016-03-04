import {logs as actions} from '../actions'
import {LOG_SYSTEMS, LOG_MAX_SIZE} from './constants'

const logsDefaultState = {
  list: [],
  systems: LOG_SYSTEMS,
  selectedSystem: 'bitswap',
  tail: true
}

export default function logs (state = logsDefaultState, action) {
  if (action.type === actions.LOGS.RECEIVE &&
      action.response) {
    const {response} = action

    if (state.list.length < LOG_MAX_SIZE) {
      return {
        ...state,
        list: [...state.list, response]
      }
    } else {
      return {
        ...state,
        list: [...state.list.slice(1), response]
      }
    }
  }

  if (action.type === actions.LOGS.TOGGLE_TAIL) {
    return {
      ...state,
      tail: !state.tail
    }
  }

  if (action.type === actions.LOGS.SELECT_SYSTEM) {
    return {
      ...state,
      selectedSystem: action.system
    }
  }

  return state
}

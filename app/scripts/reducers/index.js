import {combineReducers} from 'redux'
import {includes} from 'lodash'
import * as ActionTypes from '../actions'
import {LOG_SYSTEMS, LOG_MAX_SIZE} from './constants'

export function id (state = {}, action) {
  if (includes(ActionTypes.ID, action.type) &&
      action.response) {
    return Object.assign({}, state, action.response)
  }

  return state
}

const peersDefaultState = {
  ids: [],
  details: {},
  locations: {}
}

export function peers (state = peersDefaultState, action) {
  if (includes(ActionTypes.PEER_IDS, action.type) &&
      action.response) {
    return {
      ...state,
      ids: action.response
    }
  }

  if (includes(ActionTypes.PEER_DETAILS, action.type) &&
      action.response) {
    return {
      ...state,
      details: action.response
    }
  }

  if (includes(ActionTypes.PEER_LOCATIONS, action.type) &&
      action.response) {
    return {
      ...state,
      locations: action.response
    }
  }

  return state
}

const filesDefaultState = {
  list: [],
  root: '/',
  tmpDir: null
}

export function files (state = filesDefaultState, action) {
  if (includes(ActionTypes.FILES_LIST, action.type) &&
      action.response) {
    return {
      ...state,
      list: action.response
    }
  }

  if (ActionTypes.FILES.SET_ROOT === action.type) {
    return {
      ...state,
      root: action.root
    }
  }

  if (ActionTypes.FILES.CREATE_TMP_DIR === action.type) {
    return {
      ...state,
      tmpDir: {
        root: action.root,
        name: ''
      }
    }
  }

  if (ActionTypes.FILES.RM_TMP_DIR === action.type) {
    return {
      ...state,
      tmpDir: null
    }
  }

  if (ActionTypes.FILES.SET_TMP_DIR_NAME === action.type) {
    return {
      ...state,
      tmpDir: {
        ...state.tmpDir,
        name: action.name
      }
    }
  }

  return state
}

const logsDefaultState = {
  list: [],
  systems: LOG_SYSTEMS,
  selectedSystem: 'dht',
  tail: true
}

export function logs (state = logsDefaultState, action) {
  if (action.type === ActionTypes.LOGS.RECEIVE &&
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

  if (action.type === ActionTypes.LOGS.TOGGLE_TAIL) {
    return {
      ...state,
      tail: !state.tail
    }
  }

  if (action.type === ActionTypes.LOGS.SELECT_SYSTEM) {
    return {
      ...state,
      selectedSystem: action.system
    }
  }

  return state
}

export function errorMessage (state = null, action) {
  const {type, error} = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return error
  }

  return state
}

export function router (state = {pathname: '/'}, action) {
  switch (action.type) {
    case ActionTypes.UPDATE_ROUTER_STATE:
      return action.state
    default:
      return state
  }
}

const rootReducer = combineReducers({
  id,
  peers,
  files,
  logs,
  errorMessage,
  router
})

export default rootReducer

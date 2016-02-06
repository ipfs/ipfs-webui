import {combineReducers} from 'redux'
import {includes} from 'lodash'
import * as ActionTypes from '../actions'

const LOG_MAX_SIZE = 200

export function id (state = {}, action) {
  if (includes(ActionTypes.ID, action.type) &&
      action.response) {
    return Object.assign({}, state, action.response)
  }

  return state
}

export function logs (state = [], action) {
  if (action.type === ActionTypes.LOGS.RECEIVE &&
      action.response) {
    if (state.length < LOG_MAX_SIZE) {
      return [...state, action.response]
    } else {
      return [...state.slice(1), action.response]
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
  logs,
  errorMessage,
  router
})

export default rootReducer

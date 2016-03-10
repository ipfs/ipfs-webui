import {includes} from 'lodash-es'
import {peers as actions} from '../actions'

const defaultState = {
  ids: [],
  details: {},
  locations: {}
}

export default function peers (state = defaultState, action) {
  if (includes(actions.PEER_IDS, action.type) &&
      action.response) {
    return {
      ...state,
      ids: action.response
    }
  }

  if (includes(actions.PEER_DETAILS, action.type) &&
      action.response) {
    return {
      ...state,
      details: action.response
    }
  }

  if (includes(actions.PEER_LOCATIONS, action.type) &&
      action.response) {
    return {
      ...state,
      locations: action.response
    }
  }

  return state
}

import {includes} from 'lodash-es'
import {home as actions} from '../actions'

const defaultState = {}

export default function id (state = defaultState, action) {
  if (includes(actions.ID, action.type) &&
      action.response) {
    return Object.assign({}, state, action.response)
  }

  return state
}

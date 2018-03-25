import {errors as actions} from '../actions'

const defaultState = null

export default function errors (state = defaultState, action) {
  const {type, error} = action

  if (type === actions.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return error
  }

  return state
}

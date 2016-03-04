import {router as actions} from '../actions'

const defaultState = {
  pathname: '/'
}

export default function router (state = defaultState, action) {
  switch (action.type) {
    case actions.UPDATE_ROUTER_STATE:
      return action.state
    default:
      return state
  }
}

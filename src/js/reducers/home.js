import {home as actions} from '../actions'

const defaultState = {
  id: {
    id: '',
    publicKey: '',
    addresses: [],
    agentVersion: '',
    protocolVersion: ''
  },
  location: {
    formatted: ''
  }
}

export default function home (state = defaultState, action) {
  switch (action.type) {
    case actions.ID.SUCCESS:
      return {
        ...state,
        id: action.response
      }
    case actions.LOCATION.SUCCESS:
      return {
        ...state,
        location: action.response
      }
    default:
      return state
  }
}

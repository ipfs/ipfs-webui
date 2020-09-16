const bundle = {
  name: 'gateway',

  reducer: (state = { availableGateway: null }, action) => {
    if (action.type === 'SET_AVAILABLE_GATEWAY') {
      return { ...state, availableGateway: action.payload }
    }

    return state
  },

  doSetAvailableGateway: url => ({ dispatch }) => dispatch({ type: 'SET_AVAILABLE_GATEWAY', payload: url }),

  selectAvailableGateway: (state) => state?.gateway?.availableGateway
}

export default bundle

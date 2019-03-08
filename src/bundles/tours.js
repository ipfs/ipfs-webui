export default {
  name: 'tours',

  reducer: (state = { enabled: false }, action) => {
    if (action.type === 'TOURS_ENABLE') {
      return { enabled: true }
    }

    if (action.type === 'TOURS_DISABLE') {
      return { enabled: false }
    }

    return state
  },

  doEnableTours: () => ({ dispatch }) => {
    dispatch({ type: 'TOURS_ENABLE' })
  },

  doDisableTours: () => ({ dispatch }) => {
    dispatch({ type: 'TOURS_DISABLE' })
  },

  selectTours: state => state.tours,

  selectToursEnabled: state => state.tours.enabled
}

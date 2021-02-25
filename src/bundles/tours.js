import root from 'window-or-global'

const toursBundle = {
  name: 'tours',

  init: (store) => {
    const tourTooltip = root.localStorage.getItem('tourTooltip')

    if (tourTooltip) {
      store.doDisableTooltip()
    }
  },

  reducer: (state = { enabled: false, tooltip: true }, action) => {
    if (action.type === 'TOURS_ENABLE') {
      return { ...state, enabled: true }
    }

    if (action.type === 'TOURS_DISABLE') {
      return { ...state, enabled: false }
    }

    if (action.type === 'TOURS_TOOLTIP_DISABLE') {
      return { ...state, tooltip: false }
    }

    return state
  },

  doDisableTooltip: () => ({ dispatch }) => {
    root.localStorage.setItem('tourTooltip', false)
    dispatch({ type: 'TOURS_TOOLTIP_DISABLE' })
  },

  doEnableTours: () => ({ dispatch }) => {
    dispatch({ type: 'TOURS_ENABLE' })
  },

  doDisableTours: () => ({ dispatch }) => {
    dispatch({ type: 'TOURS_DISABLE' })
  },

  selectTours: state => state.tours,

  selectToursEnabled: state => state.tours.enabled,

  selectShowTooltip: state => state.tours.tooltip
}
export default toursBundle

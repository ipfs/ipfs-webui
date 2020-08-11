import { createAsyncResourceBundle, createSelector } from 'redux-bundler'

const bundle = createAsyncResourceBundle({
  name: 'cliTutorMode',
  actionBaseType: 'CLI_TUTOR_MODE_TOGGLE',
  persist: true,
  checkIfOnline: false,
  getPromise: () => {}
})

bundle.reactIsCliTutorModeEnabled = createSelector(
  'selectIsCliTutorModeEnabled',
  (isCliTutorModeEnabled) => {
    const isEnabled = Boolean(JSON.parse(localStorage.getItem('isCliTutorModeEnabled')))

    if (isCliTutorModeEnabled !== undefined && isCliTutorModeEnabled !== isEnabled) {
      localStorage.setItem('isCliTutorModeEnabled', isCliTutorModeEnabled)
    }
  }
)

bundle.selectIsCliTutorModeEnabled = state => state.cliTutorMode.isCliTutorModeEnabled

bundle.selectIsCliTutorModalOpen = state => !!state.cliTutorMode.showCliTutorModal

bundle.selectCliOptions = state => state.cliTutorMode.cliOptions

bundle.reducer = (state = {}, action) => {
  if (action.type === 'CLI_TUTOR_MODE_TOGGLE') {
    return { ...state, isCliTutorModeEnabled: action.payload }
  }
  if (action.type === 'CLI_TUTOR_MODAL_ENABLE') {
    return { ...state, showCliTutorModal: action.payload }
  }
  if (action.type === 'CLI_OPTIONS') {
    return { ...state, cliOptions: action.payload }
  }

  return state
}

bundle.doToggleCliTutorMode = key => ({ dispatch }) => {
  dispatch({
    type: 'CLI_TUTOR_MODE_TOGGLE',
    payload: key
  })
}

bundle.doSetCliOptions = cliOptions => ({ dispatch }) => {
  dispatch({
    type: 'CLI_OPTIONS',
    payload: cliOptions
  })
}

bundle.doOpenCliTutorModal = openModal => ({ dispatch }) => {
  dispatch({
    type: 'CLI_TUTOR_MODAL_ENABLE',
    payload: openModal
  })
}

bundle.doOpenCliTutorModal = openModal => ({ dispatch }) => {
  dispatch({
    type: 'CLI_TUTOR_MODAL_ENABLE',
    payload: openModal
  })
}

bundle.init = store => {
  const isEnabled = Boolean(JSON.parse(localStorage.getItem('isCliTutorModeEnabled')))
  return store.doToggleCliTutorMode(isEnabled)
}
export default bundle

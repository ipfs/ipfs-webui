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

// Wrap the original reducer (like peers.js does) instead of replacing it.
// The original reducer provides initial state with fields like errorTimes: []
// that auto-generated selectors need. Replacing it with state={} causes
// "can't access property 'slice', resource.errorTimes is undefined" crash
// when localStorage.debug is set (redux-bundler debug mode evaluates all
// selectors on startup).
const asyncResourceReducer = bundle.reducer

bundle.reducer = (state, action) => {
  const asyncResult = asyncResourceReducer(state, action)

  if (action.type === 'CLI_TUTOR_MODE_TOGGLE') {
    return { ...asyncResult, isCliTutorModeEnabled: action.payload }
  }
  if (action.type === 'CLI_TUTOR_MODAL_ENABLE') {
    return { ...asyncResult, showCliTutorModal: action.payload }
  }
  if (action.type === 'CLI_OPTIONS') {
    return { ...asyncResult, cliOptions: action.payload }
  }

  return asyncResult
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

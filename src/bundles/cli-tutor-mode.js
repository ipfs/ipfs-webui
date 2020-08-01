export default {
  name: 'cliTutorMode',
  actionBaseType: 'CLI_TUTOR_MODE_TOGGLE',
  init: store => {
    store.cliTutorMode = true
  },
  persist: true,
  checkIfOnline: false,
  doToggleCliTutorMode: key => ({ dispatch }) => {
    const isEnabled = JSON.parse(localStorage.getItem('isCliTutorModeEnabled'))
    localStorage.setItem('isCliTutorModeEnabled', JSON.stringify(!isEnabled))
    dispatch({
      type: 'CLI_TUTOR_MODE_TOGGLE',
      payload: { isEnabled: !isEnabled }
    })
  },
  doOpenCliTutorModal: openModal => ({ dispatch }) => {
    dispatch({
      type: 'CLI_TUTOR_MODAL_ENABLE',
      payload: { showCliTutorModal: openModal }
    })
  },
  doSetCliOptions: cliOptions => ({ dispatch }) => {
    dispatch({
      type: 'CLI_OPTIONS',
      payload: { cliOptions }
    })
  },
  reducer: (state = { isEnabled: true }, action) => {
    if (action.type === 'CLI_TUTOR_MODE_TOGGLE') {
      return { ...state, isEnabled: !action.payload }
    }
    if (action.type === 'CLI_TUTOR_MODAL_ENABLE') {
      return { ...state, showCliTutorModal: action.payload.showCliTutorModal }
    }
    if (action.type === 'CLI_OPTIONS') {
      return { ...state, cliOptions: action.payload.cliOptions }
    }

    return state
  },
  selectIsCliTutorModeEnabled: () => {
    return JSON.parse(localStorage.getItem('isCliTutorModeEnabled'))
  },
  selectIsCliTutorModalOpen: state => {
    /*
      @TODO this needs further investigation, showCliTutorModal returns an object sometimes
    */
    return !!state.cliTutorMode.showCliTutorModal
  },
  selectCliOptions: state => {
    return state.cliTutorMode.cliOptions
  }
}

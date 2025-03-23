import { createAsyncResourceBundle, createSelector } from 'redux-bundler';
import useCliTutorMode from '../../hooks/useCliTutorMode';

const bundle = createAsyncResourceBundle({
  name: 'cliTutorMode',
  actionBaseType: 'CLI_TUTOR_MODE_TOGGLE',
  persist: true,
  checkIfOnline: false,
  getPromise: () => {},
});

bundle.reactIsCliTutorModeEnabled = createSelector(
  'selectIsCliTutorModeEnabled',
  (isCliTutorModeEnabled) => {
    const isEnabled = Boolean(JSON.parse(localStorage.getItem('isCliTutorModeEnabled')));

    if (isCliTutorModeEnabled !== undefined && isCliTutorModeEnabled !== isEnabled) {
      localStorage.setItem('isCliTutorModeEnabled', isCliTutorModeEnabled);
    }
  }
);

bundle.selectIsCliTutorModeEnabled = state => state.cliTutorMode.isCliTutorModeEnabled;
bundle.selectIsCliTutorModalOpen = state => !!state.cliTutorMode.showCliTutorModal;
bundle.selectCliOptions = state => state.cliTutorMode.cliOptions;

bundle.reducer = (state = {}, action) => {
  if (action.type === 'CLI_TUTOR_MODE_TOGGLE') {
    return { ...state, isCliTutorModeEnabled: action.payload };
  }
  if (action.type === 'CLI_TUTOR_MODAL_ENABLE') {
    return { ...state, showCliTutorModal: action.payload };
  }
  if (action.type === 'CLI_OPTIONS') {
    return { ...state, cliOptions: action.payload };
  }
  return state;
};

bundle.init = store => {
  const isEnabled = Boolean(JSON.parse(localStorage.getItem('isCliTutorModeEnabled')));
  return store.doToggleCliTutorMode(isEnabled);
};

export default bundle;

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAsyncResourceBundle, createSelector } from 'redux-bundler';

const useCliTutorMode = () => {
  const dispatch = useDispatch();
  const isCliTutorModeEnabled = useSelector(state => state.cliTutorMode.isCliTutorModeEnabled);
  const showCliTutorModal = useSelector(state => !!state.cliTutorMode.showCliTutorModal);
  const cliOptions = useSelector(state => state.cliTutorMode.cliOptions);

  const doToggleCliTutorMode = (key) => {
    dispatch({
      type: 'CLI_TUTOR_MODE_TOGGLE',
      payload: key,
    });
  };

  const doSetCliOptions = (cliOptions) => {
    dispatch({
      type: 'CLI_OPTIONS',
      payload: cliOptions,
    });
  };

  const doOpenCliTutorModal = (openModal) => {
    dispatch({
      type: 'CLI_TUTOR_MODAL_ENABLE',
      payload: openModal,
    });
  };

  useEffect(() => {
    const isEnabled = Boolean(JSON.parse(localStorage.getItem('isCliTutorModeEnabled')));
    doToggleCliTutorMode(isEnabled);
  }, []);

  return {
    isCliTutorModeEnabled,
    showCliTutorModal,
    cliOptions,
    doToggleCliTutorMode,
    doSetCliOptions,
    doOpenCliTutorModal,
  };
};

export default useCliTutorMode;

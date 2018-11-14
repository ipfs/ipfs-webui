let bundle = {
  name: 'ipfsDesktop',
  reducer: (state = {}) => state,
  selectIsIpfsDesktop: () => !!window.ipfsDesktop
}

if (window.ipfsDesktop) {
  bundle = {
    ...bundle,
    reducer: window.ipfsDesktop.reducer,
    selectDesktopSettings: window.ipfsDesktop.selectDesktopSettings,
    doDesktopStartListening: window.ipfsDesktop.doDesktopStartListening,
    doDesktopSettingsToggle: window.ipfsDesktop.doDesktopSettingsToggle,
    init: window.ipfsDesktop.init
  }
}

export default bundle

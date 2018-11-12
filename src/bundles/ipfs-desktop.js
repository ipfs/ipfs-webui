const bundle = {
  name: 'ipfs-desktop',
  reducer: (state = {}) => state,
  selectIsIpfsDesktop: () => !!window.ipfsDesktop,
  selectDesktopSettings: window.ipfsDesktop.selectDesktopSettings,
  doDesktopStartListening: window.ipfsDesktop.doDesktopStartListening,
  doDesktopSettingsToggle: window.ipfsDesktop.doDesktopSettingsToggle,
  init: window.ipfsDesktop.init
}

export default bundle

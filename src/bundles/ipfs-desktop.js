let bundle = {
  name: 'ipfsDesktop',
  reducer: (state = {}) => state,
  selectIsIpfsDesktop: () => !!window.ipfsDesktop,
  selectDesktopCountlyActions: () => ([])
}

if (window.ipfsDesktop) {
  bundle = {
    ...bundle,
    selectDesktopVersion: () => window.ipfsDesktop.version,

    selectDesktopCountlyDeviceId: () => window.ipfsDesktop.countlyDeviceId,

    selectDesktopCountlyActions: () => window.ipfsDesktop.countlyActions,

    doDesktopAddConsent: consent => () => {
      return window.ipfsDesktop.addConsent(consent)
    },

    doDesktopRemoveConsent: consent => () => {
      return window.ipfsDesktop.removeConsent(consent)
    }
  }
}

export default bundle

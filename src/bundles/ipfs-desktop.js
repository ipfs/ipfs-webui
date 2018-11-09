const bundle = {
  name: 'ipfs-desktop',
  reducer: (state = {}) => state,
  selectHasIpfsDesktop: () => !!window.ipfsDesktop,
  ...(window.ipfsDesktop || {})
}

export default bundle

// @ts-check
/**
 * TODO: This might change, current version from: https://github.com/ipfs/go-ipfs/blob/petar/pincli/core/commands/remotepin.go#L53
 * @typedef {Object} RemotePin
 * @property {string} id
 * @property {string} name
 * @property {('queued'|'pinning'|'pinned'|'failed')} status
 * @property {string} cid
 * @property {Array<string>} [delegates] e.g. ["/dnsaddr/pin-service.example.com"]
*/
const pinningBundle = {
  name: 'pinning',
  reducer: (state = {
    remotePins: []
  }, action) => {
    if (action.type === 'SET_REMOTE_PINS') {
      return { ...state, remotePins: action.payload }
    }
    return state
  },

  doFetchRemotePins: () => async ({ dispatch, store }) => {
    // const pinningServices = store.selectPinningServices()

    // if (!pinningServices?.length) return

    // // TODO: unmock this (e.g. const pins = ipfs.pin.remote.ls ...)
    // const response = [
    //   {
    //     id: 'Pinata:UniqueIdOfPinRequest',
    //     status: 'queued',
    //     cid: 'QmQsUbcVx6Vu8vtL858FdxD3sVBE6m8uP3bjFoTzrGubmX',
    //     name: '26_remote.png',
    //     delegates: ['/dnsaddr/pin-service.example.com']
    //   }
    // ]

    // // TODO: get type of item?

    // const remotePins = response.map(item => ({
    //   ...item,
    //   isRemotePin: true,
    //   type: item.type || 'unknown',
    //   size: Math.random() * 1000// TODO: files.stat in the future
    // }))

    // // TODO: handle different status (queued = async fetch in batches to update ui?)

    const remotePins = []

    dispatch({ type: 'SET_REMOTE_PINS', payload: remotePins })
  },

  selectRemotePins: (state) => state.pinning.remotePins || [],

  doSelectRemotePinsForFile: (file) => ({ store }) => {
    const pinningServicesNames = store.selectPinningServices().map(remote => remote.name)
    const remotePinForFile = store.selectRemotePins().filter(pin => pin.cid === file.cid.string)
    const servicesBeingUsed = remotePinForFile.map(pin => pin.id.split(':')[0]).filter(pinId => pinningServicesNames.includes(pinId))

    return servicesBeingUsed
  },

  // selectPinningServices: state => state.pinning
  // TODO: unmock this
  selectPinningServices: () => ([
    // {
    //   name: 'Pinata',
    //   icon: 'https://ipfs.io/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg',
    //   totalSize: 3122312,
    //   bandwidthUsed: '10 GB/mo',
    //   autoUpload: 'ALL_FILES',
    //   addedAt: new Date(1592491648581)
    // }, {
    //   name: 'Infura',
    //   icon: 'https://ipfs.io/ipfs/QmTt6KeaNXyaaUBWn2zEG8RiMfPPPeMesXqnFWqqC5o6yc?filename=infura.png',
    //   totalSize: 4412221323,
    //   bandwidthUsed: '2 GB/mo',
    //   autoUpload: 'DISABLED',
    //   addedAt: new Date(1592491648591)
    // }, {
    //   name: 'Eternum',
    //   icon: 'https://ipfs.io/ipfs/QmSrqJeuYrYDmSgAy3SeAyTsYMksNPfK5CSN91xk6BBnF9?filename=eternum.png',
    //   totalSize: 512000,
    //   bandwidthUsed: '6 GB/mo',
    //   autoUpload: 'PINS_ONLY',
    //   addedAt: new Date(1592491648691)
    // }
  ]),

  selectAvailablePinningServices: () => ([
    // {
    //   name: 'Pinata',
    //   icon: 'https://ipfs.io/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg'
    // }, {
    //   name: 'Infura',
    //   icon: 'https://ipfs.io/ipfs/QmTt6KeaNXyaaUBWn2zEG8RiMfPPPeMesXqnFWqqC5o6yc?filename=infura.png'
    // }, {
    //   name: 'Eternum',
    //   icon: 'https://ipfs.io/ipfs/QmSrqJeuYrYDmSgAy3SeAyTsYMksNPfK5CSN91xk6BBnF9?filename=eternum.png'
    // }
  ]),

  doSetPinning: (cid, services = []) => async ({ getIpfs, store }) => {
    const ipfs = getIpfs()

    const pinLocally = services.includes('local')
    try {
      pinLocally ? await ipfs.pin.add(cid) : await ipfs.pin.rm(cid)
    } catch (e) {
      console.error(e)
    } finally {
      await store.doPinsFetch()
    }

    // TODO: handle rest of services
  }
}
export default pinningBundle

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
export default {
  name: 'pinning',
  reducer: (state = {
    remotePins: []
  }, action) => {
    if (action.type === 'SET_PINS') {
      return { ...state, remotePins: action.payload }
    }
    return state
  },

  doFetchRemotePins: async () => ({ dispatch }) => {
    // TODO: unmock this (e.g. const pins = (await fetch(/pins)).json() ...)
    const response = [
      {
        id: 'UniqueIdOfPinRequest',
        status: 'queued',
        cid: 'QmCIDToBePinned',
        name: 'my precious data',
        delegates: ['/dnsaddr/pin-service.example.com']
      }
    ]

    dispatch({ type: 'SET_REMOTE_PINS', payload: response })
  },

  selectRemotePins: (state) => state.pinning.remotePins,

  // selectPinningServices: state => state.pinning
  // TODO: unmock this
  selectPinningServices: () => ([
    {
      name: 'Pinata',
      icon: 'https://ipfs.io/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg',
      totalSize: 3122312,
      bandwidthUsed: '10 GB/mo',
      autoUpload: 'ALL_FILES',
      addedAt: new Date(1592491648581)
    }, {
      name: 'Infura',
      icon: 'https://ipfs.io/ipfs/QmTt6KeaNXyaaUBWn2zEG8RiMfPPPeMesXqnFWqqC5o6yc?filename=infura.png',
      totalSize: 4412221323,
      bandwidthUsed: '2 GB/mo',
      autoUpload: 'DISABLED',
      addedAt: new Date(1592491648591)
    }, {
      name: 'Eternum',
      icon: 'https://ipfs.io/ipfs/QmSrqJeuYrYDmSgAy3SeAyTsYMksNPfK5CSN91xk6BBnF9?filename=eternum.png',
      totalSize: 512000,
      bandwidthUsed: '6 GB/mo',
      autoUpload: 'PINS_ONLY',
      addedAt: new Date(1592491648691)
    }
  ]),

  selectAvailablePinningServices: () => ([
    {
      name: 'Pinata',
      icon: 'https://ipfs.io/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg'
    }, {
      name: 'Infura',
      icon: 'https://ipfs.io/ipfs/QmTt6KeaNXyaaUBWn2zEG8RiMfPPPeMesXqnFWqqC5o6yc?filename=infura.png'
    }, {
      name: 'Eternum',
      icon: 'https://ipfs.io/ipfs/QmSrqJeuYrYDmSgAy3SeAyTsYMksNPfK5CSN91xk6BBnF9?filename=eternum.png'
    }
  ])
}

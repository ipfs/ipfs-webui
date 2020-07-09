export default {
  name: 'pinning',
  reducer: (state = {}) => state,

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

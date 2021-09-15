// This is a list of predefined templates for popular services from the IPFS
// community.  We are open to reviewing PRs that add more entries here,
// but only well-established and mission-aligned services will be accepted.
const pinningServiceTemplates = [
  {
    name: 'Crust Pinner',
    icon: 'http://dweb.link/ipfs/QmRf1sssyxJqr4unHd7PP2pSSmYvaKT2ajoFHhMTpzKocu?filename=crust.svg',
    apiEndpoint: 'https://pin.crustcode.com/psa',
    visitServiceUrl: 'https://wiki.crust.network/docs/en/buildIPFSW3AuthPin'
  },
  {
    name: 'Pinata',
    icon: 'https://dweb.link/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg',
    apiEndpoint: 'https://api.pinata.cloud/psa',
    visitServiceUrl: 'https://pinata.cloud/documentation#PinningServicesAPI'
  }
]

export {
  pinningServiceTemplates
}

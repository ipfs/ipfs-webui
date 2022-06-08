// This is a list of predefined templates for popular services from the IPFS
// community.  We are open to reviewing PRs that add more entries here,
// but only well-established and mission-aligned services will be accepted.

const complianceReportsHomepage = 'https://ipfs-shipyard.github.io/pinning-service-compliance'

const pinningServiceTemplates = [
  {
    name: 'Pinata',
    icon: 'https://dweb.link/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg',
    apiEndpoint: 'https://api.pinata.cloud/psa',
    visitServiceUrl: 'https://pinata.cloud/documentation#PinningServicesAPI'
  }
]

export {
  complianceReportsHomepage,
  pinningServiceTemplates
}

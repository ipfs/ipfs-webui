// @ts-check
// This is a list of predefined templates for popular services from the IPFS
// community.  We are open to reviewing PRs that add more entries here,
// but only well-established and mission-aligned services will be accepted.
// Services listed here are returned in a random order to ensure UI does not
// promote any of them more than others.

const complianceReportsHomepage = 'https://ipfs-shipyard.github.io/pinning-service-compliance'

/**
 * @typedef {object} PinningServiceTemplate
 * @property {string} name
 * @property {string} icon
 * @property {string} apiEndpoint
 * @property {string} visitServiceUrl
 * @property {string} [complianceReportUrl]
 */

/**
 * @type {PinningServiceTemplate[]}
 */
const pinningServiceTemplates = [
  {
    name: 'Pinata',
    icon: 'https://dweb.link/ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg',
    apiEndpoint: 'https://api.pinata.cloud/psa',
    visitServiceUrl: 'https://docs.pinata.cloud/api-reference/pinning-service-api'
  },
  {
    name: 'Filebase',
    icon: 'https://dweb.link/ipfs/QmWBaeu6y1zEcKbsEqCuhuDHPL3W8pZouCPdafMCRCSUWk?filename=filebase.png',
    apiEndpoint: 'https://api.filebase.io/v1/ipfs',
    visitServiceUrl: 'https://docs.filebase.com/api-documentation/ipfs-pinning-service-api'
  },
  {
    name: 'Functionland',
    icon: 'https://dweb.link/ipfs/bafybeidgnnvgm6i3pfzhjakgzcdwdbvwtmkkx7vzeiyvtk2b4oxis53vhm?filename=functionland.png',
    apiEndpoint: 'https://api.cloud.fx.land',
    visitServiceUrl: 'https://docs.fx.land/pinning-service/ipfs-pinning-service-api'
  },
  {
    name: 'Web3.Storage',
    icon: 'https://dweb.link/ipfs/bafybeiaqsdwuwemchbofzok4cq7cuvotfs6bgickxdqr6f7hdt7a64cwwa/Web3.Storage-logo.svg',
    apiEndpoint: 'https://api.web3.storage',
    visitServiceUrl: 'https://web3.storage/docs/how-tos/pinning-services-api/'
  },
  {
    name: '4EVERLAND',
    icon: 'https://dweb.link/ipfs/bafkreie4mg2rmoe6fzct4rpwd2d4nuok3yx2mew567nu3s5bfnnmlb65ei?filename=4everland-logo.svg',
    apiEndpoint: 'https://api.4everland.dev',
    visitServiceUrl: 'https://docs.4everland.org/storage/4ever-pin/pinning-services-api'
  },
  {
    name: 'Scaleway',
    icon: 'https://dweb.link/ipfs/QmTM7RtYsuJFoV7y3Ec1WdGTW8knKrjwbY6ByTGsJN6TYw?filename=scaleway.svg',
    apiEndpoint: 'https://<your-volume-region-code>.ipfs.labs.scw.cloud/<your-volume-id>/',
    visitServiceUrl: 'https://www.scaleway.com/en/docs/labs/ipfs-pinning/reference-content/install-ipfs-desktop/'
  }
].map((service) => {
  try {
    const domain = new URL(service.apiEndpoint).hostname
    service.complianceReportUrl = `${complianceReportsHomepage}/${domain}.html`
  } catch (e) {
    // if apiEndpoint is not a valid URL, don't add complianceReportUrl
    // TODO: fix support for template apiEndpoints
  }
  return { service, sort: Math.random() }
}).sort((a, b) => a.sort - b.sort).map(({ service }) => service)

export {
  complianceReportsHomepage,
  pinningServiceTemplates
}

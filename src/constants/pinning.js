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
    visitServiceUrl: 'https://pinata.cloud/documentation#PinningServicesAPI'
  },
  {
    name: 'Filebase',
    icon: 'https://dweb.link/ipfs/QmWBaeu6y1zEcKbsEqCuhuDHPL3W8pZouCPdafMCRCSUWk?filename=filebase.png',
    apiEndpoint: 'https://api.filebase.io/v1/ipfs',
    visitServiceUrl: 'https://docs.filebase.com/api-documentation/ipfs-pinning-service-api'
  },
  {
    name: 'Web3.Storage',
    icon: 'https://dweb.link/ipfs/bafybeiaqsdwuwemchbofzok4cq7cuvotfs6bgickxdqr6f7hdt7a64cwwa/Web3.Storage-logo.svg',
    apiEndpoint: 'https://api.web3.storage',
    visitServiceUrl: 'https://web3.storage/docs/how-tos/pinning-services-api/'
  },
  {
    name: 'Estuary',
    icon: 'https://dweb.link/ipfs/bafkreicn36fjx2tlanzslpayomdhgerh7oovlaasfkg7ltzgztf7a3buu4?filename=Estuary-logo.svg',
    apiEndpoint: 'https://api.estuary.tech/pinning',
    visitServiceUrl: 'https://docs.estuary.tech/tutorial-get-an-api-key'
  },
  {
    name: '4EVERLAND',
    icon: 'https://dweb.link/ipfs/bafkreie4mg2rmoe6fzct4rpwd2d4nuok3yx2mew567nu3s5bfnnmlb65ei?filename=4everland-logo.svg',
    apiEndpoint: 'https://api.4everland.dev',
    visitServiceUrl: 'https://docs.4everland.org/storage/4ever-pin/pinning-services-api'
  },
  {
    name: 'Scaleway',
    icon: 'https://dweb.link/ipfs/QmQnbWQCw4YKn53hTizARdMacvw6b3yFCqpQEPrSxVgXXL',
    apiEndpoint: 'https://<your-volume-region-code>.ipfs.labs.scw.cloud/<your-volume-id>/',
    visitServiceUrl: 'https://www.scaleway.com/en/docs/labs/ipfs/api-cli/ipfs-desktop/'
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

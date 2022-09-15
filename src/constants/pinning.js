// @ts-check
// This is a list of predefined templates for popular services from the IPFS
// community.  We are open to reviewing PRs that add more entries here,
// but only well-established and mission-aligned services will be accepted.

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
    apiEndpoint: 'https://api.web3.storage/pins',
    visitServiceUrl: 'https://web3.storage/docs/how-tos/pinning-services-api/'
  },
  {
    name: 'Estuary',
    icon: 'https://dweb.link/ipfs/bafkreicn36fjx2tlanzslpayomdhgerh7oovlaasfkg7ltzgztf7a3buu4?filename=Estuary-logo.svg',
    apiEndpoint: 'https://api.estuary.tech/pinning/pins',
    visitServiceUrl: 'https://docs.estuary.tech/tutorial-get-an-api-key'
  }

].map((service) => {
  const domain = new URL(service.apiEndpoint).hostname
  service.complianceReportUrl = `${complianceReportsHomepage}/${domain}.html`
  return service
})

export {
  complianceReportsHomepage,
  pinningServiceTemplates
}

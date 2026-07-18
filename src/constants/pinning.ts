// This is a list of predefined templates for popular services from the IPFS
// community.  We are open to reviewing PRs that add more entries here,
// but only well-established and mission-aligned services will be accepted.
// Services listed here are returned in a random order to ensure UI does not
// promote any of them more than others.

const complianceReportsHomepage = 'https://ipfs-shipyard.github.io/pinning-service-compliance'

interface PinningServiceTemplate {
  name: string
  // Gateway-relative path to the provider icon (no host), resolved against the
  // available gateway at render time so it loads the same way as file previews.
  iconPath: string
  apiEndpoint: string
  visitServiceUrl: string
  complianceReportUrl?: string
}

interface PinningServiceTemplateWithCompliance extends PinningServiceTemplate {
  complianceReportUrl: string
}

interface SortablePinningServiceTemplate {
  service: PinningServiceTemplate | PinningServiceTemplateWithCompliance
  sort: number
}

const pinningServiceTemplates: PinningServiceTemplate[] = [
  {
    name: 'Pinata',
    iconPath: 'ipfs/QmVYXV4urQNDzZpddW4zZ9PGvcAbF38BnKWSgch3aNeViW?filename=pinata.svg',
    apiEndpoint: 'https://api.pinata.cloud/psa',
    visitServiceUrl: 'https://docs.pinata.cloud/api-reference/pinning-service-api'
  },
  {
    name: 'Filebase',
    iconPath: 'ipfs/QmWBaeu6y1zEcKbsEqCuhuDHPL3W8pZouCPdafMCRCSUWk?filename=filebase.png',
    apiEndpoint: 'https://api.filebase.io/v1/ipfs',
    visitServiceUrl: 'https://docs.filebase.com/api-documentation/ipfs-pinning-service-api'
  },
  {
    name: 'Functionland',
    iconPath: 'ipfs/QmWYEmdYq9Ry2xtb69oZSPXb8Aos24kWdVecsT3txVe38E?filename=functionland.svg',
    apiEndpoint: 'https://api.cloud.fx.land',
    visitServiceUrl: 'https://docs.fx.land/pinning-service/ipfs-pinning-service-api'
  },
  {
    name: '4EVERLAND',
    iconPath: 'ipfs/bafkreie4mg2rmoe6fzct4rpwd2d4nuok3yx2mew567nu3s5bfnnmlb65ei?filename=4everland-logo.svg',
    apiEndpoint: 'https://api.4everland.dev',
    visitServiceUrl: 'https://docs.4everland.org/storage/4ever-pin/pinning-services-api'
  },
  {
    name: 'MinPin',
    iconPath: 'ipfs/QmNv6CX3NNdRsfBCTAoKKpvMv4PsgaP8xJXZvZ1xUD7Kyx?filename=minpin-logo.svg',
    apiEndpoint: 'https://minpin.me',
    visitServiceUrl: 'https://minpin.me/docs/getting-started'
  }
].map<SortablePinningServiceTemplate>((service) => {
  let complianceReportUrl: string | undefined
  try {
    const domain = new URL(service.apiEndpoint).hostname
    complianceReportUrl = `${complianceReportsHomepage}/${domain}.html`
  } catch (e) {
    // if apiEndpoint is not a valid URL, don't add complianceReportUrl
    // TODO: fix support for template apiEndpoints
    return { service, sort: Math.random() }
  }
  return {
    service: { ...service, complianceReportUrl } satisfies PinningServiceTemplateWithCompliance,
    sort: Math.random()
  } satisfies SortablePinningServiceTemplate
})
  .sort((a, b) => a.sort - b.sort)
  .map<PinningServiceTemplate>(({ service }) => service)

export {
  complianceReportsHomepage,
  pinningServiceTemplates
}

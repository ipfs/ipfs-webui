import React from 'react'
import { multiaddr } from '@multiformats/multiaddr'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Address from '../components/address/Address.js'
import Details from '../components/details/Details.js'
import ProviderLink from '../components/provider-link/ProviderLink.js'
import { Definition, DefinitionList } from '../components/definition/Definition.js'

function isMultiaddr (addr) {
  try {
    multiaddr(addr)
    return true
  } catch (_) {
    return false
  }
}
const getField = (obj, field, fn) => {
  if (obj && obj[field]) {
    if (fn) {
      return fn(obj[field])
    }

    return obj[field]
  }

  return ''
}

const NodeInfoAdvanced = ({ t, identity, ipfsProvider, ipfsApiAddress, gatewayUrl, isNodeInfoOpen, doSetIsNodeInfoOpen }) => {
  let publicKey = null
  let addresses = null
  if (identity) {
    publicKey = getField(identity, 'publicKey')
    addresses = [...new Set(identity.addresses)].sort().map(addr => <Address key={addr} value={addr} />)
  }

  const handleSummaryClick = (ev) => {
    doSetIsNodeInfoOpen(!isNodeInfoOpen)
    ev.preventDefault()
  }

  const asAPIString = (value) => {
    // hide raw JSON if advanced config is present in the string
    return typeof value !== 'string'
      ? t('customApiConfig')
      : value
  }

  return (
    <Details className='mt3 f6' summaryText={t('app:terms.advanced')} open={isNodeInfoOpen} onClick={handleSummaryClick}>
      <DefinitionList className='mt3'>
        <Definition advanced term={t('app:terms.gateway')} desc={gatewayUrl} />
        {ipfsProvider === 'httpClient'
          ? <Definition advanced term={t('app:terms.api')} desc={
            (<div id="http-api-address" className="flex items-center">
              {isMultiaddr(ipfsApiAddress)
                ? (<Address value={ipfsApiAddress} />)
                : asAPIString(ipfsApiAddress)
              }
              <a className='ml2 link blue sans-serif fw6' href="#/settings">{t('app:actions.edit')}</a>
            </div>)
          } />
          : <Definition advanced term={t('app:terms.api')} desc={<ProviderLink name={ipfsProvider} />} />
        }
        <Definition advanced term={t('app:terms.addresses')} desc={addresses} />
        <Definition advanced term={t('app:terms.publicKey')} desc={publicKey} />
      </DefinitionList>
    </Details>
  )
}

export default connect(
  'selectIdentity',
  'selectIpfsProvider',
  'selectIpfsApiAddress',
  'selectGatewayUrl',
  'selectIsNodeInfoOpen',
  'doSetIsNodeInfoOpen',
  withTranslation('status')(NodeInfoAdvanced)
)

import React from 'react'
import multiaddr from 'multiaddr'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Address from '../components/address/Address'
import Details from '../components/details/Details'
import ProviderLink from '../components/provider-link/ProviderLink'
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

  return (
    <Details className='mt3 f6' summaryText={t('advanced')} open={isNodeInfoOpen} onClick={handleSummaryClick}>
      <DefinitionList className='mt3'>
        <Definition advanced term={t('gateway')} desc={gatewayUrl} />
        {ipfsProvider === 'httpClient'
          ? <Definition advanced term={t('api')} desc={
            (<div className="flex items-center">
              {isMultiaddr(ipfsApiAddress)
                ? (<Address value={ipfsApiAddress} />)
                : ipfsApiAddress
              }
              <a className='ml2 link blue sans-serif fw6' href="#/settings">{t('apiEdit')}</a>
            </div>)
          } />
          : <Definition advanced term={t('api')} desc={<ProviderLink name={ipfsProvider} />} />
        }
        <Definition advanced term={t('addresses')} desc={addresses} />
        <Definition advanced term={t('publicKey')} desc={publicKey} />
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

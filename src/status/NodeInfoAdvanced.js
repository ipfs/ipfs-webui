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

class NodeInfoAdvanced extends React.Component {
  getField (obj, field, fn) {
    if (obj && obj[field]) {
      if (fn) {
        return fn(obj[field])
      }

      return obj[field]
    }

    return ''
  }

  render () {
    const { t, identity, ipfsProvider, ipfsApiAddress, gatewayUrl } = this.props
    let publicKey = null
    let addresses = null
    if (identity) {
      publicKey = this.getField(identity, 'publicKey')
      addresses = [...new Set(identity.addresses)].sort().map(addr => <Address key={addr} value={addr} />)
    }
    return (
      <Details className='mt3 f6' summaryText={t('advanced')}>
        <DefinitionList className='mt3'>
          <Definition advanced term={t('gateway')} desc={gatewayUrl} />
          {ipfsProvider === 'js-ipfs-api'
            ? <Definition advanced term={t('api')} desc={
              isMultiaddr(ipfsApiAddress)
                ? <Address value={ipfsApiAddress} />
                : ipfsApiAddress
            } />
            : <Definition advanced term={t('api')} desc={<ProviderLink name={ipfsProvider} />} />
          }
          <Definition advanced term={t('addresses')} desc={addresses} />
          <Definition advanced term={t('publicKey')} desc={publicKey} />
        </DefinitionList>
      </Details>
    )
  }
}

export default connect(
  'selectIdentity',
  'selectIpfsProvider',
  'selectIpfsApiAddress',
  'selectGatewayUrl',
  withTranslation('status')(NodeInfoAdvanced)
)

import React from 'react'
import { connect } from 'redux-bundler-react'
import { translate } from 'react-i18next'
import Address from '../components/address/Address'
import Details from '../components/details/Details'
import ProviderLink from '../components/provider-link/ProviderLink'

const Block = ({ children }) => (
  <div className='dt dt--fixed pt2 mw9'>
    { children }
  </div>
)

const Label = ({ children }) => (
  <label className='dtc silver tracked ttu f7 lh-copy' style={{ width: '100px' }}>{children}</label>
)

const Value = ({ children, advanced = false }) => (
  <div className='dtc charcoal monospace word-wrap f7 lh-copy pa2 bg-white-80'>{children}</div>
)

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
        <div className='mt3'>
          <Block>
            <Label>{t('gateway')}</Label>
            <Value advanced>{gatewayUrl}</Value>
          </Block>
          <Block>
            <Label>{t('api')}</Label>
            <Value advanced>
              {ipfsProvider === 'js-ipfs-api' && (
                <Address value={ipfsApiAddress} />
              )}
              {ipfsProvider !== 'js-ipfs-api' && (
                <ProviderLink name={ipfsProvider} />
              )}
            </Value>
          </Block>
          <Block>
            <Label>{t('addresses')}</Label>
            <Value advanced>{addresses}</Value>
          </Block>
          <Block>
            <Label>{t('publicKey')}</Label>
            <Value advanced>{publicKey}</Value>
          </Block>
        </div>
      </Details>
    )
  }
}

export default connect(
  'selectIdentity',
  'selectIpfsProvider',
  'selectIpfsApiAddress',
  'selectGatewayUrl',
  translate('status')(NodeInfoAdvanced)
)

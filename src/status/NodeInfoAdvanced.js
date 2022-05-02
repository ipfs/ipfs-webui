/* eslint-disable space-before-function-paren */
import React from 'react'
import multiaddr from 'multiaddr'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'
import Address from '../components/address/Address'
import ProviderLink from '../components/provider-link/ProviderLink'
import { Definition, DefinitionList } from '../components/definition/Definition.js'

import RetroButton from '../components/common/atoms/RetroButton'
import RetroText from '../components/common/atoms/RetroText'
import SectionIcon from '../icons/retro/SectionIcon'
import styled from 'styled-components'

function isMultiaddr(addr) {
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

const AdvancedButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const AdvancedButtonHr = styled.hr`
  width: 100%;
  border-color: #312F62;
`

const NodeInfoAdvanced = ({ t, identity, ipfsProvider, ipfsApiAddress, gatewayUrl, isNodeInfoOpen, doSetIsNodeInfoOpen }) => {
  let publicKey = null
  let addresses = null
  if (identity) {
    publicKey = getField(identity, 'publicKey')
    addresses = [...new Set(identity.addresses)].sort().map(addr => <Address key={addr} value={addr} />)
  }

  const handleSummaryClick = (ev) => {
    doSetIsNodeInfoOpen(!isNodeInfoOpen)
  }

  const asAPIString = (value) => {
    // hide raw JSON if advanced config is present in the string
    return typeof value !== 'string'
      ? t('customApiConfig')
      : value
  }

  return (
    <>
      {isNodeInfoOpen && (
        <DefinitionList className='mt3'>
          <AdvancedButtonHr />
          <Definition advanced term={t('app:terms.gateway')} desc={gatewayUrl} />
          {ipfsProvider === 'httpClient'
            ? <Definition advanced term={t('app:terms.api')} desc={
              (<div id="http-api-address" className="flex items-baseline">
                {isMultiaddr(ipfsApiAddress)
                  ? (<Address value={ipfsApiAddress} />)
                  : asAPIString(ipfsApiAddress)
                }
                <a className='ml2 link purple pixm fw4' href="#/settings">{t('app:actions.edit')}</a>
              </div>)
            } />
            : <Definition advanced term={t('app:terms.api')} desc={<ProviderLink name={ipfsProvider} />} />
          }
          <Definition advanced term={t('app:terms.addresses')} desc={addresses} />
          <Definition advanced term={t('app:terms.publicKey')} desc={publicKey} />
        </DefinitionList>
      )}
      <AdvancedButtonWrapper>
        <AdvancedButtonHr />
        <RetroButton activeBgColor={'transparent'} focusBgColor={'transparent'} width='100%' border='none' active={false} onClick={handleSummaryClick}>
          <RetroText color='#8476BB'>
            <SectionIcon color={'#8476BB'} style={{ position: 'relative', left: '-20px', transform: isNodeInfoOpen ? 'rotate(270deg)' : 'rotate(90deg)' }} />
            {t('app:terms.advanced')}
          </RetroText>
        </RetroButton>
        <AdvancedButtonHr />
      </AdvancedButtonWrapper>
    </>
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

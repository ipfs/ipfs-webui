import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import GreenPoint from '../icons/retro/GreenPoint'

export const StatusConnected = ({ t }) => {
  return (
    <header>
      <h1 style={{ fontSize: '14px', fontWeight: '400', color: '#00FF75', textShadow: '0px 4px 5px rgba(0, 0, 0, 0.6)' }} className='pixm ma0 pt0 pb3 flex'>
        <Trans i18nKey='app:status.connectedToIpfs' t={t}>Connected to IPFS</Trans>
        <GreenPoint style={{ marginLeft: '9px', marginTop: '6px' }}/>
      </h1>
    </header>
  )
}

export const TranslatedStatusConnected = withTranslation('status')(StatusConnected)

export default connect(
  'selectPeersCount',
  'selectRepoSize',
  TranslatedStatusConnected
)

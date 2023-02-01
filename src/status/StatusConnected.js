import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import { humanSize } from '../lib/files.js'

export const StatusConnected = ({ t, peersCount, repoSize }) => {
  const humanRepoSize = humanSize(repoSize || 0)
  return (
    <header>
      <h1 className='montserrat fw2 f3 charcoal ma0 pt0 pb2'>
        <Trans i18nKey='app:status.connectedToIpfs' t={t}>Connected to IPFS</Trans>
      </h1>
      <p className='montserrat fw4 f5 ma0 pb3 lh-copy'>
        <span className='db dib-ns'>
          <a className='link blue' href='#/files'>
            {t('StatusConnected.repoSize', { repoSize: humanRepoSize })}
          </a>
        </span>
        <span className='dn di-ns gray'> — </span>
        <span className='db mt1 mt0-ns dib-ns'>
          <a className='link blue' href='#/peers'>
            {t('StatusConnected.peersCount', { peersCount: peersCount.toString() })}
          </a>
        </span>
      </p>
    </header>
  )
}

export const TranslatedStatusConnected = withTranslation('status')(StatusConnected)

export default connect(
  'selectPeersCount',
  'selectRepoSize',
  TranslatedStatusConnected
)

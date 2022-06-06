import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import { humanSize } from '../lib/files'

export const StatusConnected = ({ t, peersCount, repoSize, downloadedSize, sharedSize }) => {
  const humanRepoSize = humanSize(repoSize || 0)
  downloadedSize = downloadedSize || 0
  const humanDownloadSize = humanSize(downloadedSize)
  sharedSize = sharedSize || 0
  const humanSharedSize = humanSize(sharedSize)
  let shareRatio = sharedSize / downloadedSize
  if (isNaN(shareRatio)) {
    shareRatio = Infinity
  }
  if (shareRatio < 10) {
    // round to 1 decimal place if that bellow 10
    shareRatio = Math.round(shareRatio * 10) / 10
  } else {
    shareRatio = Math.round(shareRatio)
  }
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
          {t('StatusConnected.shareSize', { downloadedSize: humanDownloadSize, sharedSize: humanSharedSize, ratio: shareRatio })}
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
  'selectDownloadedSize',
  'selectSharedSize',
  TranslatedStatusConnected
)

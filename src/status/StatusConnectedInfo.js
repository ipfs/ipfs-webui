/* eslint-disable space-before-function-paren */
/* eslint-disable semi */
import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import { humanSize } from '../lib/files'

const purpleFontStyle = {
  fontWeight: 800,
  fontSize: '12px',
  lineHeight: '24px',
  letterSpacing: '0.09em',
  /* identical to box height, or 200% */
  /* 8476BB */
  color: '#8476BB',
  textDecoration: 'none'
}

export const StatusConnectedInfo = ({ t, peersCount, repoSize }) => {
  const humanRepoSize = humanSize(repoSize || 0)
  const repoSizeStr = getSeparatedString(t('StatusConnected.repoSize', { repoSize: '_' }));
  const peersCountStr = getSeparatedString(t('StatusConnected.peersCount', { peersCount: '_' }));

  function getSeparatedString(str) {
    if (str.indexOf('_') === 0) {
      return ['', str.slice(1)];
    }
    if (str.indexOf('_') === str.length - 1) {
      return [str.slice(0, str.length - 2)];
    }
    return str.split('_');
  }

  return (
    <p style={{ fontSize: '14px', fontWeight: '400' }} className='pixm ma0 pb3 lh-copy'>
      <span className='db dib-ns w95fa' style={{ ...purpleFontStyle }}>
        {repoSizeStr[0]}
        <a className='pixm f7' href='#/files' style={{ ...purpleFontStyle }}>
          {humanRepoSize + repoSizeStr[1]}
        </a>
      </span>
      <span className='dn di-ns' style={{ ...purpleFontStyle }}> — </span>
      <span className='db mt1 mt0-ns dib-ns w95fa' style={{ ...purpleFontStyle }}>
        {peersCountStr[0]}
        <a className='pixm f7' href='#/peers' style={{ ...purpleFontStyle }}>
          {peersCount.toString() + peersCountStr[1]}
        </a>
      </span>
    </p>
  )
}

export const TranslatedStatusConnectedInfo = withTranslation('status')(StatusConnectedInfo)

export default connect(
  'selectPeersCount',
  'selectRepoSize',
  TranslatedStatusConnectedInfo
)

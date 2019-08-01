import React from 'react'
import { translate, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import filesize from 'filesize'

export const StatusConnected = ({ peersCount, repoSize }) => {
  const humanRepoSize = filesize(repoSize || 0, { round: 1 })
  return (
    <header>
      <h1 className='montserrat fw2 f3 charcoal ma0 pt0 pb2'>
        <Trans i18nKey='StatusConnected.header1'>Connected to IPFS</Trans>
      </h1>
      <p className='montserrat fw4 f5 ma0 pb3 lh-copy'>
        <span className='db dib-ns'>
          <Trans
            i18nKey='StatusConnected.paragraph1'
            defaults='Hosting <0>{repoSize} of files</0>'
            values={{ repoSize: humanRepoSize }}
            components={[<a className='link blue' href='#/files'>?</a>]}
          />
        </span>
        <span className='dn di-ns gray'> — </span>
        <span className='db mt1 mt0-ns dib-ns'>
          <Trans
            i18nKey='StatusConnected.paragraph2'
            defaults='Discovered <0>{peersCount} peers</0>'
            values={{ peersCount: peersCount.toString() }}
            components={[<a className='link blue' href='#/peers'>?</a>]}
          />
        </span>
      </p>
    </header>
  )
}

export const TranslatedStatusConnected = translate('status')(StatusConnected)

export default connect(
  'selectPeersCount',
  'selectRepoSize',
  TranslatedStatusConnected
)

import React from 'react'
import { translate, Trans } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import filesize from 'filesize'

const StatusHeader = ({ peers, repoSize }) => {
  const totalFiles = filesize(repoSize || 0, { round: 0 })
  const totalPeers = (peers && peers.length) || 0
  return (
    <header>
      <h1 className='montserrat fw2 f3 charcoal ma0 pt0 pb2'>
        <Trans i18nKey='StatusHeader.h1'>Connected to IPFS</Trans>
      </h1>
      <a className='dn sans-serif link bg-blue f6 fw4 ph2 pv1 white br2 v-btm ml4 tc' style={{ minWidth: 88 }} href='#/peers'>
        {totalPeers.toString()} peers
      </a>
      <h2 className='montserrat fw4 f5 ma0 pb3'>
        <Trans i18nKey='StatusHeader.h2'>
          Hosting <a className='link blue' href='#/files'>{totalFiles} of files</a>. Discovered <a className='link blue' href='#/peers'>{totalPeers.toString()} peers</a>
        </Trans>
      </h2>
    </header>
  )
}

export default connect(
  'selectPeers',
  'selectRepoSize',
  translate('status')(StatusHeader)
)

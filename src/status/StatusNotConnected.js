import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Shell from '../components/shell/Shell'
import GlyphAttention from '../icons/GlyphAttention'

const StatusNotConnected = ({ t }) => {
  return (
    <header>
      <div className='flex items-center'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <h1 className='montserrat fw4 charcoal ma0 f3 red'>
          <Trans i18nKey='StatusNotConnected.header1' t={t}>
            Could not connect to the IPFS API
          </Trans>
        </h1>
      </div>
      <Trans i18nKey='StatusNotConnected.paragraph1' t={t}>
        <p className='mv3'>Is your IPFS daemon running? Try starting or restarting it from your terminal:</p>
      </Trans>
      <Shell>
        <code className='db'><b className='no-select'>$ </b>ipfs daemon</code>
        <code className='db'>Initializing daemon...</code>
        <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
      </Shell>
      <Trans i18nKey='StatusNotConnected.paragraph2' t={t}>
        <p className='mt3 lh-copy sans-serif'>For more information, check out the installation guide in the <a className='link blue' href='https://docs.ipfs.io/install/command-line-quick-start/' target='_blank' rel='noopener noreferrer'>IPFS Docs</a>.</p>
      </Trans>
    </header>
  )
}

export default withTranslation('status')(StatusNotConnected)

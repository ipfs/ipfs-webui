import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Shell from '../components/shell/Shell'

const StatusNotConnected = ({ t }) => {
  return (
    <header>
      <h1 className='montserrat fw2 f3 yellow ma0 lh-title'>
        <Trans i18nKey='StatusNotConnected.header1' t={t}>
          Failed to connect to the API
        </Trans>
      </h1>
      <Trans i18nKey='StatusNotConnected.paragraph1' t={t}>
        <p className='mv3 lh-copy sans-serif'>Start an IPFS daemon in a terminal:</p>
      </Trans>
      <Shell className='mw6'>
        <code className='db'><b className='no-select'>$ </b>ipfs daemon</code>
        <code className='db'>Initializing daemon...</code>
        <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
      </Shell>
      <Trans i18nKey='StatusNotConnected.paragraph2' t={t}>
        <p className='mt3 lh-copy sans-serif'>For more info on how to get started with IPFS you can <a className='link blue' href='https://docs.ipfs.io/introduction/usage/'>read the guide</a>.</p>
      </Trans>
    </header>
  )
}

export default withTranslation('status')(StatusNotConnected)

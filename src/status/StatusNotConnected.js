import React from 'react'
import { translate, Trans } from 'react-i18next'
import Shell from '../components/shell/Shell'

const StatusNotConnected = () => {
  return (
    <header>
      <h1 className='montserrat fw2 f3 yellow ma0 pt0 pb2'>
        <Trans i18nKey='notConnected.paragraph1'>
          Failed to connect to the API
        </Trans>
      </h1>
      <Trans i18nKey='notConnected.paragraph3'>
        <p>Start an IPFS daemon in a terminal:</p>
      </Trans>
      <Shell>
        <code className='db'>$ ipfs daemon</code>
        <code className='db'>Initializing daemon...</code>
        <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
      </Shell>
      <Trans i18nKey='notConnected.paragraph4'>
        <p className='mt4'>For more info on how to get started with IPFS you can <a className='link blue' href='https://docs.ipfs.io/introduction/usage/'>read the guide</a>.</p>
      </Trans>
    </header>
  )
}

export default translate('status')(StatusNotConnected)

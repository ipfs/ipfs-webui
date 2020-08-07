import React from 'react'
import { withTranslation, Trans } from 'react-i18next'
import Shell from '../components/shell/Shell'
import GlyphAttention from '../icons/GlyphAttention'
import ApiAddressForm from '../components/api-address-form/ApiAddressForm'

const StatusNotConnected = ({ t, ipfsApiAddress, doUpdateIpfsApiAddress }) => {
  return (
    <header>
      <div className='flex items-center'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <h1 className='montserrat fw4 charcoal ma0 f3 red'>
          <Trans i18nKey='StatusNotConnected.header' t={t}>
            Could not connect to the IPFS API
          </Trans>
        </h1>
      </div>
      <Trans i18nKey='StatusNotConnected.paragraph1' t={t}>
        <p className='fw6 mb3 lh-copy charcoal'>Check out the installation guide in the <a className='link blue' href='https://docs.ipfs.io/install/command-line-quick-start/' target='_blank' rel='noopener noreferrer'>IPFS Docs</a>, or try these common fixes:</p>
      </Trans>
      <ol className='pl3 pt2 lh-copy charcoal'>
        <Trans i18nKey='StatusNotConnected.paragraph2' t={t}>
          <li className='mb3'>Is your IPFS daemon running? Try starting or restarting it from your terminal:</li>
        </Trans>
        <Shell>
          <code className='db'><b className='no-select'>$ </b>ipfs daemon</code>
          <code className='db'>Initializing daemon...</code>
          <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
        </Shell>
        <Trans i18nKey='notConnected.paragraph3' t={t}>
          <li className='mt4 mb3'>Is your IPFS API on a port other than 5001? If your node is configured with a <a className='link blue' href='https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, enter it here to update your config file.</li>
        </Trans>
        <ApiAddressForm
          t={t}
          defaultValue={ipfsApiAddress || ''}
          updateAddress={doUpdateIpfsApiAddress} />
      </ol>
    </header>
  )
}

export default withTranslation('status')(StatusNotConnected)

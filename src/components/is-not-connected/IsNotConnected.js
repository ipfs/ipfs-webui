import React, { useState } from 'react'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import classNames from 'classnames'
import ApiAddressForm from '../api-address-form/ApiAddressForm.js'
import Box from '../box/Box.js'
import Shell from '../shell/Shell.js'
import GlyphAttention from '../../icons/GlyphAttention.js'

const TABS = {
  UNIX: 'unix',
  POWERSHELL: 'windowsPS',
  WINDOWS: 'windowsCMD'
}

const IsNotConnected = ({ t, apiUrl, connected, sameOrigin, ipfsApiAddress, doUpdateIpfsApiAddress }) => {
  const [activeTab, setActiveTab] = useState(TABS.UNIX)
  const defaultDomains = ['http://localhost:3000', 'http://127.0.0.1:5001', 'https://webui.ipfs.io']
  const origin = window.location.origin
  const addOrigin = defaultDomains.indexOf(origin) === -1
  return (
    <Box className='pv3 ph4 lh-copy charcoal'>
      <div className='flex flex-wrap items-center'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <h1 className='montserrat fw4 charcoal ma0 f3 red'>{t('app:status.couldNotConnect')}</h1>
      </div>
      <Trans i18nKey='notConnected.paragraph1' t={t}>
        <p className='fw6 mb3'>Check out the installation guide in the <a className='link blue' href='https://docs.ipfs.io/install/command-line-quick-start/' target='_blank' rel='noopener noreferrer'>IPFS Docs</a>, or try these common fixes:</p>
      </Trans>
      <ol className='pl3 pt2'>
        <Trans i18nKey='notConnected.paragraph2' t={t}>
          <li className='mb3'>Is your IPFS daemon running? Try starting or restarting it from your terminal:</li>
        </Trans>
        <Shell title='Any Shell'>
          <code className='db'><b className='no-select'>$ </b>ipfs daemon</code>
          <code className='db'>Initializing daemon...</code>
          <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
        </Shell>
        { !sameOrigin && (
          <div>
            <Trans i18nKey='notConnected.paragraph3' t={t}>
              <li className='mb3 mt4'>Is your IPFS API configured to allow <a className='link blue' href='https://github.com/ipfs-shipyard/ipfs-webui#configure-ipfs-api-cors-headers'>cross-origin (CORS) requests</a>? If not, run these commands and then start your daemon from the terminal:</li>
            </Trans>
            <div className='br1 overflow-hidden'>
              <div className='f7 mb0 sans-serif charcoal pv1 pl2 bg-black-20 flex items-center overflow-x-auto'>
                <button onClick={() => setActiveTab(TABS.UNIX)} className={classNames('pointer mr3 ttu tracked', activeTab === TABS.UNIX && 'fw7')}>
                Unix & MacOS
                </button>
                <button onClick={() => setActiveTab(TABS.POWERSHELL)} className={classNames('pointer mr3 ttu tracked', activeTab === TABS.POWERSHELL && 'fw7')}>
                  Windows Powershell
                </button>
                <button onClick={() => setActiveTab(TABS.WINDOWS)} className={classNames('pointer ttu tracked', activeTab === TABS.WINDOWS && 'fw7')}>
                  Windows CMD
                </button>
              </div>
              <div className='bg-black-70 snow pa2 f7 lh-copy monospace nowrap overflow-x-auto'>
                { activeTab === TABS.UNIX && (
                  <div>
                    <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `"${origin}", `}"{defaultDomains.join('", "')}"]'</code>
                    <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'</code>
                  </div>
                )}
                { activeTab === TABS.POWERSHELL && (
                  <div>
                    <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `\\"${origin}\\", `}\"{defaultDomains.join('\\", \\"')}\"]'</code>
                    <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\", \"POST\"]'</code>
                  </div>
                )}
                { activeTab === TABS.WINDOWS && (
                  <div>
                    <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[{addOrigin && `"""${origin}""", `}"""{defaultDomains.join('""", """')}"""]"</code>
                    <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "["""PUT""", """POST"""]"</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <Trans i18nKey='notConnected.paragraph4' t={t}>
          <li className='mt4 mb3'>Is your IPFS API on a port other than 5001? If your node is configured with a <a className='link blue' href='https://github.com/ipfs/kubo/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, enter it here.</li>
        </Trans>
        <ApiAddressForm
          t={t}
          defaultValue={ipfsApiAddress || ''}
          updateAddress={doUpdateIpfsApiAddress} />
      </ol>
    </Box>
  )
}

export default connect(
  'selectIpfsConnected',
  'selectApiUrl',
  withTranslation('welcome')(IsNotConnected)
)

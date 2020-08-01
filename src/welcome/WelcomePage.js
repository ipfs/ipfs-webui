import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import classNames from 'classnames'
import ReactJoyride from 'react-joyride'
import withTour from '../components/tour/withTour'
import { welcomeTour } from '../lib/tours'
import { getJoyrideLocales } from '../helpers/i8n'

// Components
import ApiAddressForm from '../components/api-address-form/ApiAddressForm'
import Box from '../components/box/Box'
import AboutIpfs from '../components/about-ipfs/AboutIpfs'
import Shell from '../components/shell/Shell.js'
import ComponentLoader from '../loader/ComponentLoader.js'
import GlyphTick from '../icons/GlyphTick'
import GlyphAttention from '../icons/GlyphAttention'
import CliTutorMode from '../components/cli-tutor-mode/CliTutorMode'

const WelcomePage = ({ t, apiUrl, ipfsInitFailed, ipfsConnected, ipfsReady, toursEnabled, handleJoyrideCallback }) => {
  if (!ipfsInitFailed && !ipfsReady) {
    return <ComponentLoader pastDelay />
  }

  const isSameOrigin = window.location.origin === apiUrl

  return (
    <div>
      <Helmet>
        <title>{t('title')}</title>
      </Helmet>
      <div className='lh-copy charcoal'>
        <Box className='pv3 ph4'>
          <ConnectionStatus connected={ipfsConnected} sameOrigin={isSameOrigin} t={t} />
        </Box>
      </div>
      <div className='flex-ns mt3'>
        <div className='mr3-ns lh-copy mid-gray w-50-ns'>
          <Box>
            <h1 className='mt0 mb3 montserrat fw2 f3 charcoal'>{t('welcomeInfo.header')}</h1>
            <ul className='pl3'>
              <Trans i18nKey='welcomeInfo.paragraph1' t={t}>
                <li className='mb2'><a href='#/' className='link blue u b'>Check your node status</a>, including how many peers you're connected to, your storage and bandwidth stats, and more</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph2' t={t}>
                <li className='mb2'><a href='#/files' className='link blue u b'>View and manage files</a> in your IPFS repo, including drag-and-drop file import, easy pinning, and quick sharing and download options</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph3' t={t}>
                <li className='mb2'><a href='#/explore' className='link blue b'>Visit the "Merkle Forest"</a> with some sample datasets and explore IPLD, the data model that underpins how IPFS works</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph4' t={t}>
                <li className='mb2'><a href='#/peers' className='link blue b'>See who's connected to your node</a>, geolocated on a world map by their IP address</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph5' t={t}>
                <li className='mb2'><a href='#/settings' className='link blue b'>Review or edit your node settings</a> &mdash; no command line required</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph6' t={t}>
                <li className='f5'><a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link blue b' target='_blank' rel='noopener noreferrer'>Check this app's source code</a> to <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link blue' target='_blank' rel='noopener noreferrer'>report a bug</a> or make a contribution, and make IPFS better for everyone!</li>
              </Trans>
            </ul>
          </Box>
        </div>
        <div className='lh-copy mid-gray w-50-ns mt3 mt0-ns'>
          <AboutIpfs />
        </div>
      </div>
      <ReactJoyride
        run={toursEnabled}
        steps={welcomeTour.getSteps({ t })}
        styles={welcomeTour.styles}
        callback={handleJoyrideCallback}
        scrollToFirstStep
        locale={getJoyrideLocales(t)} />
    </div>
  )
}

const TABS = {
  UNIX: 'unix',
  POWERSHELL: 'windowsPS',
  WINDOWS: 'windowsCMD'
}

const ConnectionStatus = ({ t, connected, sameOrigin, ipfsApiAddress, doUpdateIpfsApiAddress }) => {
  const [activeTab, setActiveTab] = useState(TABS.UNIX)

  if (connected) {
    return (
      <div>
        <div className='flex flex-wrap items-center'>
          <GlyphTick style={{ height: 76 }} className='fill-green' role='presentation' />
          <h1 className='montserrat fw4 charcoal ma0 f3 green'>{t('connected.header')}</h1>
        </div>
        <p className='fw6 mt1 ml3-ns w-100'>{t('connected.paragraph1')}</p>
      </div>
    )
  }

  const defaultDomains = ['http://localhost:3000', 'http://127.0.0.1:5001', 'https://webui.ipfs.io']
  const origin = window.location.origin
  const addOrigin = defaultDomains.indexOf(origin) === -1

  return (
    <div>
      <div className='flex flex-wrap items-center'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <h1 className='montserrat fw4 charcoal ma0 f3 red'>{t('notConnected.header')}</h1>
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
          <li className='mt4 mb3'>Is your IPFS API on a port other than 5001? If your node is configured with a <a className='link blue' href='https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, enter it here to update your config file.</li>
        </Trans>
        <ApiAddressForm
          t={t}
          defaultValue={ipfsApiAddress || ''}
          updateAddress={doUpdateIpfsApiAddress} />
      </ol>
    </div>
  )
}

export default connect(
  'selectIpfsInitFailed',
  'selectIpfsConnected',
  'selectIpfsReady',
  'selectApiUrl',
  'selectToursEnabled',
  withTour(withTranslation('welcome')(WelcomePage))
)

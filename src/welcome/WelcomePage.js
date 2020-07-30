import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../components/box/Box'
import Button from '../components/button/Button'
import AboutIpfs from '../components/about-ipfs/AboutIpfs'
import Shell from '../components/shell/Shell.js'
import ComponentLoader from '../loader/ComponentLoader.js'
import GlyphTick from '../icons/GlyphTick'
import GlyphAttention from '../icons/GlyphAttention'

const WelcomePage = ({ t, doUpdateIpfsApiAddress, apiUrl, ipfsInitFailed, ipfsConnected, ipfsReady, ipfsApiAddress }) => {
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
        <Box>
          <ConnectionStatus connected={ipfsConnected} sameOrigin={isSameOrigin} t={t} />
        </Box>
      </div>
      <div className='flex mt3'>
        <div className='mr3 lh-copy mid-gray w-50'>
          <Box>
            <h1 className='mt0 mb3 montserrat fw2 f3 charcoal'>{t('welcomeInfo.header')}</h1>
            <ul className='pl3'>
              <Trans i18nKey='welcomeInfo.paragraph1' t={t}>
                <li className='mb2'><a href='#/' className='link blue u b'>Check the status</a> of your node, its Peer ID and connection info, the network traffic and the number of connected peers.</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph2' t={t}>
                <li className='mb2'>Easily manage files in your IPFS repo. Drag and drop here to add files, move and rename them, delete, share or download them.</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph3' t={t}>
                <li className='mb2'>You can <a href='#/explore' className='link blue b'>explore IPLD data</a> that underpins how IPFS works.</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph4' t={t}>
                <li className='mb2'>See all of your <a href='#/peers' className='link blue b'>connected peers</a>, geolocated by their IP address.</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph5' t={t}>
                <li className='mb2'><a href='#/settings' className='link blue b'>Review the settings</a> for your IPFS node, and update them to better suit your needs.</li>
              </Trans>
              <Trans i18nKey='welcomeInfo.paragraph6' t={t}>
                <li className='f5'>If you want to help push the Web UI forward, <a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link blue'>check out its code</a> or <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link blue'>report a bug</a>!</li>
              </Trans>
            </ul>
          </Box>
        </div>
        <div className='lh-copy dn db-l mid-gray w-50'>
          <AboutIpfs />
        </div>
      </div>
      <div className='lh-copy charcoal mt3'>
        <Box>
            <ApiAddressForm
            t={t}
            defaultValue={ipfsApiAddress || ''}
            updateAddress={doUpdateIpfsApiAddress} />
        </Box>
      </div>
    </div>
  )
}

class ApiAddressForm extends React.Component {
  constructor (props) {
    super(props)
    this.state = { value: props.defaultValue }
  }

  onChange = (event) => {
    const val = event.target.value
    this.setState({ value: val })
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit(event)
    }
  }

  onSubmit = async (event) => {
    event.preventDefault()
    this.props.updateAddress(this.state.value)
  }

  render () {
    const { t } = this.props
    return (
      <form onSubmit={this.onSubmit}>
        <label htmlFor='api-address' className='db f7 mb2 ttu tracked charcoal pl1'>{t('apiAddressForm.apiLabel')}</label>
        <input id='api-address'
          type='text'
          className='w-100 lh-copy monospace f5 pl1 pv1 mb2 charcoal input-reset ba b--black-20 br1 focus-outline'
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          value={this.state.value} />
        <div className='tr'>
          <Button className="tc">{t('apiAddressForm.submitButton')}</Button>
        </div>
      </form>
    )
  }
}

const ConnectionStatus = ({ t, connected, sameOrigin, ipfsApiAddress, doUpdateIpfsApiAddress }) => {
  if (connected) {
    return (
      <div>
        <div className='flex items-center'>
          <GlyphTick style={{ height: 76 }} className='fill-green' role='presentation' />
          <h1 className='montserrat fw4 charcoal ma0 f3 green'>{t('connected.header')}</h1>
        </div>
        <p className='fw6 mt1 ml3'>{t('connected.paragraph1')}</p>
      </div>
    )
  }

  const defaultDomains = ['http://localhost:3000', 'http://127.0.0.1:5001', 'https://webui.ipfs.io']
  const origin = window.location.origin
  const addOrigin = defaultDomains.indexOf(origin) === -1

  function makeActive(e) {
    console.log(e.target.id + '-code');
  }

  return (
    <div>
      <div className='flex items-center'>
        <GlyphAttention style={{ height: 76 }} className='fill-red mr' role='presentation' />
        <h1 className='montserrat fw4 charcoal ma0 f3 red'>{t('notConnected.header')}</h1>
      </div>
      <Trans i18nKey='notConnected.paragraph1' t={t}>
        <p className='fw6 mb3'>Check out the installation guide in the <a className='link blue' href='https://docs.ipfs.io/install/command-line-quick-start/' target='_blank'>IPFS Docs</a>, or try these common fixes:</p>
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
              <div className='f7 mb0 sans-serif ttu tracked charcoal pv1 pl2 bg-black-20 flex items-center'>
                <div id='unix-mac' className='pointer mr3 fw7' onClick={makeActive}>Unix & MacOS</div>
                <div id='windows-powershell' className='pointer mr3' onClick={makeActive}>Windows Powershell</div>
                <div id='windows-cmd' className='pointer' onClick={makeActive}>Windows CMD</div>
              </div>
              <div className='bg-black-70 snow pa2 f7 lh-copy monospace nowrap overflow-x-auto'>
                <div id='unix-mac-code'>
                  <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `"${origin}", `}"{defaultDomains.join('", "')}"]'</code>
                  <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'</code>
                </div>
                <div id='windows-powershell-code'>
                  <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `\\"${origin}\\", `}\"{defaultDomains.join('\\", \\"')}\"]'</code>
                  <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\", \"POST\"]'</code>
                </div>
                <div id='windows-cmd-code'>
                  <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[{addOrigin && `"""${origin}""", `}"""{defaultDomains.join('""", """')}"""]"</code>
                  <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "["""PUT""", """POST"""]"</code>
                </div>
              </div>
            </div>
          </div>
        )}
        <Trans i18nKey='notConnected.paragraph4' t={t}>
          <li className='mt4 mb3'>Is your API on a port other than 5001? If your IPFS node is configured with a <a className='link blue' href='https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, please set it here</li>
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
  'doUpdateIpfsApiAddress',
  'selectIpfsInitFailed',
  'selectIpfsConnected',
  'selectIpfsReady',
  'selectIpfsApiAddress',
  'selectApiUrl',
  withTranslation('welcome')(WelcomePage)
)

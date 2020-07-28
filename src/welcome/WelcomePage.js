import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import Box from '../components/box/Box'
import Button from '../components/button/Button'
import AboutIpfs from '../components/about-ipfs/AboutIpfs'
import Shell from '../components/shell/Shell.js'
import ComponentLoader from '../loader/ComponentLoader.js'

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
      <div className='pr3 lh-copy charcoal'>
        <Box>
          <ConnectionStatus connected={ipfsConnected} sameOrigin={isSameOrigin} t={t} />
          <h1 className='montserrat fw2 navy mb0 mt5 f3 yellow'>{t('configureApiPort.header')}</h1>
          <Trans i18nKey='configureApiPort.paragraph1' t={t}>
            <p>If your IPFS node is configured with a <a className='link blue' href='https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, please set it here</p>
          </Trans>
          <ApiAddressForm
            t={t}
            defaultValue={ipfsApiAddress || ''}
            updateAddress={doUpdateIpfsApiAddress} />
        </Box>
      </div>
      <div className='lh-copy dn db-l mid-gray f6 mt3'>
        <AboutIpfs />
      </div>
      <div className='flex-auto pr3 lh-copy mid-gray mt3'>
        <Box>
          <h1 className='mt0 mb3 montserrat fw4 f4 charcoal'>{t('welcomeInfo.header')}</h1>
          <Trans i18nKey='welcomeInfo.paragraph1' t={t}>
            <p className='f5'><a href='#/' className='link blue u b'>Check the status</a> of your node, its Peer ID and connection info, the network traffic and the number of connected peers.</p>
          </Trans>
          <Trans i18nKey='welcomeInfo.paragraph2' t={t}>
            <p className='f5'>Easily manage files in your IPFS repo. Drag and drop here to add files, move and rename them, delete, share or download them.</p>
          </Trans>
          <Trans i18nKey='welcomeInfo.paragraph3' t={t}>
            <p className='f5'>You can <a href='#/explore' className='link blue b'>explore IPLD data</a> that underpins how IPFS works.</p>
          </Trans>
          <Trans i18nKey='welcomeInfo.paragraph4' t={t}>
            <p className='f5'>See all of your <a href='#/peers' className='link blue b'>connected peers</a>, geolocated by their IP address.</p>
          </Trans>
          <Trans i18nKey='welcomeInfo.paragraph5' t={t}>
            <p className='mb4 f5'><a href='#/settings' className='link blue b'>Review the settings</a> for your IPFS node, and update them to better suit your needs.</p>
          </Trans>
          <Trans i18nKey='welcomeInfo.paragraph6' t={t}>
            <p className='mb0 f5'>If you want to help push the Web UI forward, <a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link blue'>check out its code</a> or <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link blue'>report a bug</a>!</p>
          </Trans>
        </Box>
      </div>
    </div>
  )
}

const ConnectionStatus = ({ t, connected, sameOrigin }) => {
  if (connected) {
    return (
      <div>
        <h1 className='montserrat fw2 navy ma0 f3 green'>{t('connected.header')}</h1>
        <Trans i18nKey='connected.paragraph1' t={t}>
          <p>Now, it's time for you to explore your node. Head to <a className='link blue' href='#/files/'>Files page</a> to manage and share your files, or explore the <a className='link blue' href='https://www.youtube.com/watch?v=Bqs_LzBjQyk'>Merkle Forest</a> of peer-hosted hash-linked data via <a className='link blue' href='#/explore'>IPLD explorer</a>.</p>
        </Trans>
        <Trans i18nKey='connected.paragraph2' t={t}>
          <p>You can always come back to this address to change the IPFS node you're connected to.</p>
        </Trans>
      </div>
    )
  }

  const defaultDomains = ['http://localhost:3000', 'http://127.0.0.1:5001', 'https://webui.ipfs.io']
  const origin = window.location.origin
  const addOrigin = defaultDomains.indexOf(origin) === -1

  return (
    <div>
      <h1 className='montserrat fw2 navy ma0 f3 yellow'>{t('notConnected.header')}</h1>
      <Trans i18nKey='notConnected.paragraph1' t={t}>
        <p>Failed to connect to the API.</p>
      </Trans>
      { !sameOrigin && (
        <div>
          <Trans i18nKey='notConnected.paragraph2' t={t}>
            <p>Make sure you <a className='link blue' href='https://github.com/ipfs-shipyard/ipfs-webui#configure-ipfs-api-cors-headers'>configure your IPFS API</a> to allow cross-origin (CORS) requests, running the commands below:</p>
          </Trans>
          <Shell title="Unix & MacOS">
            <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `"${origin}", `}"{defaultDomains.join('", "')}"]'</code>
            <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'</code>
          </Shell>
          <Shell title="Windows Powershell" className="mt4">
            <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `\\"${origin}\\", `}\"{defaultDomains.join('\\", \\"')}\"]'</code>
            <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '[\"PUT\", \"POST\"]'</code>
          </Shell>
          <Shell title="Windows CMD" className="mt4">
            <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[{addOrigin && `"""${origin}""", `}"""{defaultDomains.join('""", """')}"""]"</code>
            <code className='db'><b className='no-select'>$ </b>ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "["""PUT""", """POST"""]"</code>
          </Shell>
        </div>
      )}
      <Trans i18nKey='notConnected.paragraph3' t={t}>
        <p>Then, start/restart the IPFS daemon in a terminal:</p>
      </Trans>
      <Shell>
        <code className='db'><b className='no-select'>$ </b>ipfs daemon</code>
        <code className='db'>Initializing daemon...</code>
        <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
      </Shell>
      <Trans i18nKey='notConnected.paragraph4' t={t}>
        <p>For more info on how to get started with IPFS you can <a className='link blue' href='https://docs.ipfs.io/introduction/usage/'>read the guide</a>.</p>
      </Trans>
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

export default connect(
  'doUpdateIpfsApiAddress',
  'selectIpfsInitFailed',
  'selectIpfsConnected',
  'selectIpfsReady',
  'selectIpfsApiAddress',
  'selectApiUrl',
  withTranslation('welcome')(WelcomePage)
)

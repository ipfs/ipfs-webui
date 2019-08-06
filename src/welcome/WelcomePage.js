import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { translate, Trans } from 'react-i18next'
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
      <div className='flex'>
        <div className='flex-auto pr3 lh-copy charcoal'>
          <Box>
            <ConnectionStatus connected={ipfsConnected} sameOrigin={isSameOrigin} t={t} />
            <h1 className='montserrat fw2 navy mb0 mt5 f3 yellow'>{t('configureApiPort.header')}</h1>
            <Trans i18nKey='configureApiPort.paragraph1'>
              <p>If your IPFS node is configured with a <a className='link blue' href='https://github.com/ipfs/go-ipfs/blob/master/docs/config.md#addresses' target='_blank' rel='noopener noreferrer'>custom API address</a>, please set it here</p>
            </Trans>
            <ApiAddressForm
              t={t}
              defaultValue={ipfsApiAddress}
              updateAddress={doUpdateIpfsApiAddress} />
          </Box>
        </div>
        <div className='measure lh-copy dn db-l flex-none mid-gray f6' style={{ maxWidth: '40%' }}>
          <AboutIpfs />
        </div>
      </div>
    </div>
  )
}

const ConnectionStatus = ({ t, connected, sameOrigin }) => {
  if (connected) {
    return (
      <div>
        <h1 className='montserrat fw2 navy ma0 f3 green'>{t('connected.header')}</h1>
        <Trans i18nKey='connected.paragraph1'>
          <p>Now, it's time for you to explore your node. Head to <a className='link blue' href='#/files/'>Files page</a> to manage and share your files, or explore the <a className='link blue' href='https://www.youtube.com/watch?v=Bqs_LzBjQyk'>Merkle Forest</a> of peer-hosted hash-linked data via <a className='link blue' href='#/explore'>IPLD explorer</a>.</p>
        </Trans>
        <Trans i18nKey='connected.paragraph2'>
          <p>You can always come back to this address to change the IPFS node you're connected to.</p>
        </Trans>
      </div>
    )
  }

  const defaultDomains = ['http://127.0.0.1:5001', 'https://webui.ipfs.io']
  const origin = window.location.origin
  const addOrigin = defaultDomains.indexOf(origin) === -1

  return (
    <div>
      <h1 className='montserrat fw2 navy ma0 f3 yellow'>{t('notConnected.header')}</h1>
      <Trans i18nKey='notConnected.paragraph1'>
        <p>Failed to connect to the API.</p>
      </Trans>
      { !sameOrigin && (
        <div>
          <Trans i18nKey='notConnected.paragraph2'>
            <p>Make sure you <a className='link blue' href='https://github.com/ipfs-shipyard/ipfs-webui#configure-ipfs-api-cors-headers'>configure your IPFS API</a> to allow cross-origin (CORS) requests, running the commands below:</p>
          </Trans>
          <Shell>
            <code className='db'>$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '[{addOrigin && `"${origin}", `}"{defaultDomains.join('", "')}"]'</code>
            <code className='db'>$ ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'</code>
          </Shell>
        </div>
      )}
      <Trans i18nKey='notConnected.paragraph3'>
        <p>Start an IPFS daemon in a terminal:</p>
      </Trans>
      <Shell>
        <code className='db'>$ ipfs daemon</code>
        <code className='db'>Initializing daemon...</code>
        <code className='db'>API server listening on /ip4/127.0.0.1/tcp/5001</code>
      </Shell>
      <Trans i18nKey='notConnected.paragraph4'>
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
          <Button>{t('apiAddressForm.submitButton')}</Button>
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
  translate('welcome')(WelcomePage)
)

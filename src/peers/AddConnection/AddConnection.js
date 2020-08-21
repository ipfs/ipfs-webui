import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import isIPFS from 'is-ipfs'

import Icon from '../../icons/StrokeDecentralization'
import Button from '../../components/button/Button'
import Overlay from '../../components/overlay/Overlay'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

class AddConnection extends React.Component {
  state = {
    open: false,
    loading: false,
    hasErrored: false
  }

  toggleModal = () => {
    this.setState({
      open: !this.state.open
    })
  }

  addConnection = async (maddr) => {
    this.setState({ loading: true })
    const { type } = await this.props.doConnectSwarm(maddr)
    this.setState({ loading: false, hasErrored: true })

    if (type === 'SWARM_CONNECT_FAILED') return

    this.toggleModal()
  }

  onInputChange = () => {
    if (!this.state.hasErrored) return

    this.setState({ hasErrored: false })
  }

  getDescription = () => {
    const { t } = this.props
    const codeClass = 'w-90 mb1 pa1 bg-snow f7 charcoal-muted truncate'

    return (
      <div className='mb3 flex flex-column items-center'>
        <p className='gray w-80'>{t('insertPeerAddress')}</p>
        <span className='w-80 mv2 f7 charcoal-muted'>{t('example')}</span>
        <code className={codeClass}>/ip4/76.176.168.65/tcp/4001/p2p/QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC</code>
      </div>
    )
  }

  render () {
    const { open, loading, hasErrored } = this.state
    const { t } = this.props

    return (
      <div>
        <Button onClick={this.toggleModal} className='f6 ph3 tc' bg='bg-navy' color='white'>
          <span style={{ color: '#8CDDE6' }}>+</span> {t('addConnection')}
        </Button>

        <Overlay show={open} onLeave={this.toggleModal}>
          <TextInputModal
            validate={isIPFS.peerMultiaddr}
            onSubmit={this.addConnection}
            onCancel={this.toggleModal}
            onInputChange={this.onInputChange}
            submitText={t('add')}
            icon={Icon}
            title={t('addConnection')}
            description={this.getDescription()}
            loading={loading}
            error={hasErrored}
          />
        </Overlay>
      </div>
    )
  }
}

export default connect('doConnectSwarm', withTranslation('peers')(AddConnection))

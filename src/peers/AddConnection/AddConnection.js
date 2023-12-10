import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import * as isIPFS from 'is-ipfs'

import Checkbox from '../../components/checkbox/Checkbox.js'
import Icon from '../../icons/StrokeDecentralization.js'
import Button from '../../components/button/Button.js'
import Overlay from '../../components/overlay/Overlay.js'

import ComponentLoader from '../../loader/ComponentLoader.js'
import { Modal, ModalActions, ModalBody } from '../../components/modal/Modal.js'

class AddConnection extends React.Component {
  state = {
    open: false,
    loading: false,
    isValid: false,
    permanent: true,
    maddr: ''
  }

  toggleModal = () => {
    this.setState({
      open: !this.state.open
    })
  }

  onPeeringToggle = () => {
    this.setState({ permanent: !this.state.permanent })
  }

  onChange = (event) => {
    const { value, name } = event.target
    this.setState({ [name]: value })
    if (name === 'maddr') {
      this.setState({ isValid: isIPFS.peerMultiaddr(value) })
    }
  }

  onSubmit = async () => {
    if (!this.state.isValid) {
      return
    }

    this.setState({ loading: true })
    const { maddr, permanent } = this.state
    const { type } = await this.props.doConnectSwarm(maddr, permanent)
    const errored = type === 'SWARM_CONNECT_FAILED'
    this.setState({ loading: false, isValid: !errored })

    if (errored) return
    this.setState({ isValid: false, permanent: true, maddr: '' })
    this.toggleModal()
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit()
    }
  }

  get inputClass () {
    if (this.state.maddr === '') {
      return ''
    }

    if (this.state.isValid) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  get isDisabled () {
    return this.state.maddr === '' || !this.state.isValid
  }

  get description () {
    const { t } = this.props
    const codeClass = 'w-90 mb1 pa1 dib bg-snow f7 charcoal-muted truncate'

    return (
      <div className='mb3 flex flex-column items-center'>
        <p className='charcoal w-80'>{t('insertPeerAddress')}</p>
        <span className='w-80 mv2 f7 charcoal-muted'>{t('app:terms.example')}</span>
        <code className={codeClass}>/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN</code>
        <code className={codeClass}>/ip4/147.75.109.213/udp/4001/quic/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN</code>
      </div>
    )
  }

  render () {
    const { open, loading } = this.state
    const { t } = this.props

    return (
      <div>
        <Button onClick={this.toggleModal} className='f6 ph3 tc' bg='bg-navy' color='white'>
          <span style={{ color: '#8CDDE6' }}>+</span> {t('addConnection')}
        </Button>

        <Overlay show={open} onLeave={this.toggleModal}>
          <Modal onCancel={this.toggleModal}>
            <ModalBody title={t('addConnection')} Icon={Icon}>
              { this.description }

              <input
                name='maddr'
                type='text'
                value={this.state.maddr}
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
                required
                className={`input-reset charcoal ba b--black-20 br1 pa2 mv2 db w-90 center focus-outline ${this.inputClass}`} />

              <Checkbox
                className='dib'
                onChange={this.onPeeringToggle}
                checked={this.state.permanent}
                label={<span className='f6 charcoal-muted lh-copy'>{t('addPermanentPeer')}</span>}/>
            </ModalBody>

            <ModalActions>
              <Button className='ma2 tc' bg='bg-gray' onClick={this.toggleModal}>{t('actions.cancel')}</Button>
              <Button className='ma2 tc' bg='bg-teal' disabled={this.isDisabled} onClick={this.onSubmit}>{t('app:actions.add')}</Button>
            </ModalActions>

            { loading && (
              <div className="flex items-center justify-center absolute top-0 left-0 right-0 bottom-0">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-gray o-80"/>
                <ComponentLoader style={{ width: '50%', margin: 'auto' }} />
              </div>
            ) }
          </Modal>
        </Overlay>
      </div>
    )
  }
}

export default connect('doConnectSwarm', withTranslation('peers')(AddConnection))

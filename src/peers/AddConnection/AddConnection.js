/* eslint-disable space-before-function-paren */
import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import isIPFS from 'is-ipfs'

import Checkbox from '../../components/checkbox/Checkbox'
import Icon from '../../icons/StrokeDecentralization'
import PlusIcon from '../../icons/retro/PlusIcon'
import Overlay from '../../components/overlay/Overlay'

import ComponentLoader from '../../loader/ComponentLoader'
import { Modal, ModalActions, ModalBody } from '../../components/modal/Modal'

import RetroText from '../../components/common/atoms/RetroText'
import RetroInput from '../../components/common/atoms/RetroInput'
import RetroGradientButton from '../../components/common/atoms/RetroGradientButton'
import FullGradientButton from '../../components/common/atoms/FullGradientButton'

class AddConnection extends React.Component {
  state = {
    open: false,
    loading: false,
    isValid: false,
    permanent: true,
    maddr: ''
  }

  toggleModal = () => {
    const modalNode = document.getElementById('add_connection_modal')
    if (modalNode) {
      modalNode.classList.add('translateY')
    }

    setTimeout(() => {
      this.setState({
        open: !this.state.open
      })
    }, 500)
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

  get inputClass() {
    if (this.state.maddr === '') {
      return ''
    }

    if (this.state.isValid) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  get isDisabled() {
    return this.state.maddr === '' || !this.state.isValid
  }

  get description() {
    const { t } = this.props
    const codeClass = 'w-100 mb1 pa1 dib spacegrotesk gray f7 truncate tl'

    return (
      <div className='mb3 flex flex-column items-center white spacegrotesk'>
        <p className='ma0 tc w-100 gray mb4'>{t('insertPeerAddress')}</p>
        <span className='w-100 mv2 gray f6'>{t('app:terms.example')}</span>
        <code className={codeClass} >/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN</code>
        <code className={codeClass} >/ip4/147.75.109.213/udp/4001/quic/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN</code>
      </div>
    )
  }

  render() {
    const { open, loading } = this.state
    const { t } = this.props

    return (
      <div style={{ width: '160px', height: '30px' }}>
        <RetroGradientButton width='160px' height='38px' minHeight='28px' onClick={this.toggleModal} className='textinputmodal-body white spacegrotesk gray pb2' style={{ marginTop: '1px' }} bg='bg-navy' color='white'>
          <RetroText className='spacegrotesk white font-12 flex'>
            {t('addConnection')}&nbsp;&nbsp;
            <PlusIcon />
          </RetroText>
        </RetroGradientButton>

        <Overlay show={open} onLeave={this.toggleModal}>
          <Modal id={'add_connection_modal'} onCancel={this.toggleModal} className='outline-0 transBottomUp generic-modal spacegrotesk'>
            <ModalBody title={<p className='fs24 tc spacegrotesk'>{t('addConnection')}</p>} Icon={Icon} className='textinputmodal-body'>
              {this.description}

              <RetroInput
                withoutShadow
                name='maddr'
                type='text'
                value={this.state.maddr}
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
                required
                className={`input-reset spacegrotesk ba b--black-20 br1 pa2 mv2 db w-100 center focus-outline ${this.inputClass}`} />

              <Checkbox
                className='dib mb4'
                onChange={this.onPeeringToggle}
                checked={this.state.permanent}
                color='white'
                label={<span className='f6 white spacegrotesk lh-copy'>{t('addPermanentPeer')}</span>} />
            </ModalBody>

            <ModalActions justify='between'>
              <RetroGradientButton width='163px' height='38px' className='ma2 tc' bg='bg-gray' onClick={this.toggleModal}>
                <RetroText className='white spacegrotesk'>
                  {t('actions.cancel')}
                </RetroText>
              </RetroGradientButton>
              <FullGradientButton width='163px' height='38px' className='ma2 tc ' bg='bg-teal' disabled={this.isDisabled} onClick={this.onSubmit}>
                <RetroText color={this.isDisabled ? '#9C9C9C' : '#000'} className='spacegrotesk'>
                  {t('app:actions.add')}
                </RetroText>
              </FullGradientButton>
            </ModalActions>

            {loading && (
              <div className="flex items-center justify-center absolute top-0 left-0 right-0 bottom-0">
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-gray o-80" />
                <ComponentLoader style={{ width: '50%', margin: 'auto' }} />
              </div>
            )}
          </Modal>
        </Overlay>
      </div>
    )
  }
}

export default connect('doConnectSwarm', withTranslation('peers')(AddConnection))

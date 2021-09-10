import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'redux-bundler-react'
import isIPFS from 'is-ipfs'

import Icon from '../../icons/StrokeDecentralization'
import Button from '../../components/button/Button'
import Overlay from '../../components/overlay/Overlay'

import ComponentLoader from '../../loader/ComponentLoader'
import { Modal, ModalActions, ModalBody } from '../../components/modal/Modal'

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

  onChange = (event) => {
    const target = event.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

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
    const codeClass = 'w-90 mb1 pa1 bg-snow f7 charcoal-muted truncate'

    return (
      <div className='mb3 flex flex-column items-center'>
        <p className='gray w-80'>{t('insertPeerAddress')}</p>
        <span className='w-80 mv2 f7 charcoal-muted'>{t('app:terms.example')}</span>
        <code className={codeClass}>/ip4/76.176.168.65/tcp/4001/p2p/QmbBHw1Xx9pUpAbrVZUKTPL5Rsph5Q9GQhRvcWVBPFgGtC</code>
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
                id='permanent'
                name='permanent'
                type='checkbox'
                checked={this.state.permanent}
                className='mr1'
                onChange={this.onChange} />

              <label htmlFor='permanent'>{t('addPermanentPeer')}</label>

              <input
                name='maddr'
                type='text'
                value={this.state.maddr}
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
                required
                className={`input-reset charcoal ba b--black-20 br1 pa2 mv2 db w-90 center focus-outline ${this.inputClass}`} />
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

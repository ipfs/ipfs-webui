/* eslint-disable space-before-function-paren */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'
import { withTranslation } from 'react-i18next'
import isIPFS from 'is-ipfs'
import Icon from '../../../icons/StrokeDecentralization'
import RetroText from '../../../components/common/atoms/RetroText'
import RetroInput from '../../../components/common/atoms/RetroInput'
import FullGradientButton from '../../../components/common/atoms/FullGradientButton'
import RetroGradientButton from '../../../components/common/atoms/RetroGradientButton'
import IpfsLocationIcon from '../../../icons/retro/files/IpfsLocationIcon'
import { StyledIconContainer, StyledModalTitle } from '../new-folder-modal/NewFolderModal'
class AddByPathModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    className: PropTypes.string
  }

  static defaultProps = {
    className: ''
  }

  state = {
    path: '',
    name: ''
  }

  validatePath = (p) => {
    if (!p.startsWith('/ipfs/')) {
      p = `/ipfs/${p}`
    }

    return isIPFS.ipfsPath(p)
  }

  onChange = (event) => {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({ [name]: value })
  }

  onSubmit = () => {
    let { path, name } = this.state
    if (this.validatePath(path)) {
      // avoid issues with paths by forcing a flat filename without leading/trailing spaces
      name = name.replaceAll('/', '_').trim()
      this.props.onSubmit(path, name)
    }
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit()
    }
  }

  get inputClass() {
    if (this.state.path === '') {
      return ''
    }

    if (this.validatePath(this.state.path)) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  get isDisabled() {
    if (this.state.path === '') {
      return true
    }

    return !this.validatePath(this.state.path)
  }

  render () {
    const {
      t, tReady, onCancel, onSubmit, className, ...props
    } = this.props

    const codeClass = 'w-90 purple spacegrotesk tl w95fa f7 truncate'

    return (
      <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onCancel} style={{ maxWidth: '24em' }}>
        <ModalBody title={
          <StyledModalTitle>
            <StyledIconContainer>
              <IpfsLocationIcon />
            </StyledIconContainer>
            <span className='pl2'>{t('addByPathModal.title')}</span>
          </StyledModalTitle>
        } Icon={Icon} className='textinputmodal-body white spacegrotesk gray pb2'>
          <div className='mb3 flex flex-column '>
            <p className='mt0 spacegrotesk f6 tl w-90 grayColor'>{t('addByPathModal.description') + ' ' + t('addByPathModal.examples')}</p>
            <code className={codeClass} >/ipfs/QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V</code>
            <code className={codeClass}>QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB</code>
          </div>

          <RetroInput
            withoutShadow
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            name='path'
            required
            height='41px'
            fontSize={14}
            placeholder={t('addByPathModal.importPathPlaceholder')}
            className={`input-reset spacegrotesk charcoal ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline ${this.inputClass}`}
            type='text' />

          <RetroInput
            withoutShadow
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.name}
            fontSize={14}
            height='41px'
            placeholder={t('addByPathModal.namePlaceholder')}
            name='name'
            className='input-reset spacegrotesk charcoal white ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline'
            type='text' />
        </ModalBody>

        <ModalActions justify='between' className=' ph3'>
          <RetroGradientButton width='calc((100% - 40px) / 2)' height='38px' className='tc' onClick={onCancel}>
            <RetroText className='white spacegrotesk'>
              {t('actions.cancel')}
            </RetroText>
          </RetroGradientButton>
          <FullGradientButton width='calc((100% - 40px) / 2)' height='38px' className='tc' disabled={this.isDisabled} onClick={this.onSubmit}>
            <RetroText className='white spacegrotesk'>
              {t('app:actions.import')}
            </RetroText>
          </FullGradientButton>
        </ModalActions>
      </Modal>
    )
  }
}

export default withTranslation('files')(AddByPathModal)

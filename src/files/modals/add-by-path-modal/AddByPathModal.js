import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../../components/button/Button.js'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'
import { withTranslation } from 'react-i18next'
import * as isIPFS from 'is-ipfs'
import Icon from '../../../icons/StrokeDecentralization.js'

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

  get inputClass () {
    if (this.state.path === '') {
      return ''
    }

    if (this.validatePath(this.state.path)) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  get isDisabled () {
    if (this.state.path === '') {
      return true
    }

    return !this.validatePath(this.state.path)
  }

  render () {
    const {
      t, tReady, onCancel, onSubmit, className, ...props
    } = this.props

    const codeClass = 'w-90 mb1 pa1 tl bg-snow f7 charcoal-muted truncate'

    return (
      <Modal {...props} className={className} onCancel={onCancel}>
        <ModalBody title={t('addByPathModal.title')} Icon={Icon}>
          <div className='mb3 flex flex-column items-center'>
            <p className='mt0 charcoal tl w-90'>{t('addByPathModal.description') + ' ' + t('addByPathModal.examples')}</p>
            <code className={codeClass}>/ipfs/QmZTR5bcpQD7cFgTorqxZDYaew1Wqgfbd2ud9QqGPAkK2V</code>
            <code className={codeClass}>QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB</code>
          </div>

          <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            name='path'
            required
            placeholder={t('addByPathModal.importPathPlaceholder')}
            className={`input-reset charcoal ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline ${this.inputClass}`}
            type='text' />

          <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.name}
            placeholder={t('addByPathModal.namePlaceholder')}
            name='name'
            className='input-reset charcoal ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline'
            type='text' />
        </ModalBody>

        <ModalActions>
          <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
          <Button className='ma2 tc' bg='bg-teal' disabled={this.isDisabled} onClick={this.onSubmit}>{t('app:actions.import')}</Button>
        </ModalActions>
      </Modal>
    )
  }
}

export default withTranslation('files')(AddByPathModal)

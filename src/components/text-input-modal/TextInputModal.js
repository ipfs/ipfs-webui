/* eslint-disable space-before-function-paren */
import React from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalActions, ModalBody } from '../modal/Modal'
import ComponentLoader from '../../loader/ComponentLoader'
import { withTranslation } from 'react-i18next'

import RetroInput from '../../components/common/atoms/RetroInput'
// import RetroButton from '../common/atoms/RetroButton'
import RetroText from '../common/atoms/RetroText'
import './TextInputModal.css'
import FullGradientButton from '../common/atoms/FullGradientButton'
import RetroGradientButton from '../common/atoms/RetroGradientButton'

class TextInputModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    onInputChange: PropTypes.func,
    title: PropTypes.string.isRequired,
    Icon: PropTypes.func.isRequired,
    description: PropTypes.node,
    submitText: PropTypes.string,
    validate: PropTypes.func,
    defaultValue: PropTypes.string,
    mustBeDifferent: PropTypes.bool,
    loading: PropTypes.bool
  }

  static defaultProps = {
    className: '',
    defaultValue: '',
    submitText: 'Save',
    mustBeDifferent: false
  }

  constructor(props) {
    super(props)
    this.state = { value: props.defaultValue }
  }

  onChange = (event) => {
    let val = event.target.value

    if (this.props.onChange) {
      val = this.props.onChange(val)
    }

    this.props.onInputChange && this.props.onInputChange(val)

    this.setState({ value: val })
  }

  onSubmit = () => {
    if (!this.props.validate ||
      (this.props.validate && this.props.validate(this.state.value))) {
      this.props.onSubmit(this.state.value)
    }
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit()
    }
  }

  get inputClass() {
    if (!this.props.validate ||
      this.state.value === '' ||
      (this.props.mustBeDifferent && this.state.value === this.props.defaultValue)) {
      return ''
    }

    if (this.props.error) {
      return 'b--red-muted focus-outline-red'
    }

    if (this.props.validate(this.state.value)) {
      return 'b--green-muted focus-outline-green'
    }

    return 'b--red-muted focus-outline-red'
  }

  get isDisabled() {
    if (this.state.value === '' ||
      (this.props.mustBeDifferent && this.state.value === this.props.defaultValue)) {
      return true
    }

    if (!this.props.validate) {
      return false
    }

    return !this.props.validate(this.state.value)
  }

  render() {
    const {
      t,
      onCancel,
      onChange,
      onInputChange,
      mustBeDifferent,
      onSubmit,
      className,
      Icon,
      submitText,
      validate,
      defaultValue,
      description,
      title,
      error,
      loading,
      ...props
    } = this.props

    return (
      <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onCancel}>
        <ModalBody title={title} Icon={Icon} className='textinputmodal-body white spacegrotesk gray pb2'>
          {description && typeof description === 'object' && description}

          {description && typeof description === 'string' &&
            <p className='f5 tl center spacegrotesk gray'>{description}</p>
          }

          <RetroInput
            withoutShadow
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            required
            fontSize={14}
            className={`input-reset spacegrotesk white textinputmodal-input ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline ${this.inputClass}`}
            type='text' />
        </ModalBody>

        <ModalActions justify='between'>
          <RetroGradientButton width='calc((100% - 40px) / 2)' height='38px' onClick={onCancel} style={{ textAlign: 'center' }}>
            <RetroText color='white'>
              {t('actions.cancel')}
            </RetroText>
          </RetroGradientButton>
          {/* <RetroButton width='120px' onClick={onCancel}>

          </RetroButton> */}
          <FullGradientButton width='calc((100% - 40px) / 2)' height='38px' disabled={this.isDisabled} style={{ textAlign: 'center' }} onClick={this.onSubmit}>
            <RetroText color={this.isDisabled ? 'gray' : 'white'}>
              {submitText}
            </RetroText>
          </FullGradientButton>
          {/* <RetroButton width='120px' disabled={this.isDisabled} onClick={this.onSubmit}>

          </RetroButton> */}
        </ModalActions>

        {loading && (
          <div className="flex items-center justify-center absolute top-0 left-0 right-0 bottom-0">
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-gray o-80" />
            <ComponentLoader style={{ width: '50%', margin: 'auto' }} />
          </div>
        )}
      </Modal>
    )
  }
}

export default withTranslation('app')(TextInputModal)

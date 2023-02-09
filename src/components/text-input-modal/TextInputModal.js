import React from 'react'
import PropTypes from 'prop-types'
import Button from '../button/Button.js'
import { Modal, ModalActions, ModalBody } from '../modal/Modal.js'
import ComponentLoader from '../../loader/ComponentLoader.js'
import { withTranslation } from 'react-i18next'

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

  constructor (props) {
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

  get inputClass () {
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

  get isDisabled () {
    if (this.state.value === '' ||
      (this.props.mustBeDifferent && this.state.value === this.props.defaultValue)) {
      return true
    }

    if (!this.props.validate) {
      return false
    }

    return !this.props.validate(this.state.value)
  }

  render () {
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
      <Modal {...props} className={className} onCancel={onCancel}>
        <ModalBody title={title} Icon={Icon}>
          { description && typeof description === 'object' && description }

          { description && typeof description === 'string' &&
            <p className='charcoal w-90 tl center'>{description}</p>
          }

          <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            required
            className={`input-reset charcoal ba b--black-20 br1 pa2 mb2 db w-90 center focus-outline ${this.inputClass}`}
            type='text' />
        </ModalBody>

        <ModalActions>
          <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('actions.cancel')}</Button>
          <Button className='ma2 tc' bg='bg-teal' disabled={this.isDisabled} onClick={this.onSubmit}>{submitText}</Button>
        </ModalActions>

        { loading && (
          <div className="flex items-center justify-center absolute top-0 left-0 right-0 bottom-0">
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-light-gray o-80"/>
            <ComponentLoader style={{ width: '50%', margin: 'auto' }} />
          </div>
        ) }
      </Modal>
    )
  }
}

export default withTranslation('app')(TextInputModal)

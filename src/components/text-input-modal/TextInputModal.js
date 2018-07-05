import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../modal/Modal'

class TextInputModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    // onSubmit must return a value. That value
    // goes to the input.
    onPaste: PropTypes.func,
    title: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    description: PropTypes.string,
    submitText: PropTypes.string,
    validate: PropTypes.func,
    defaultValue: PropTypes.string
  }

  static defaultProps = {
    className: '',
    defaultValue: '',
    submitText: 'Save'
  }

  constructor (props) {
    super(props)
    this.state = { value: props.defaultValue }
  }

  onChange = (event) => {
    this.setState({ value: event.target.value })
  }

  onSubmit = () => {
    if (!this.props.validate ||
      (this.props.validate && this.props.validate(this.state.value))) {
      this.props.onSubmit(this.state.value)
    }
  }

  onPaste = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const res = this.props.onPaste(event)
    if (res !== this.state.value) {
      this.setState({ value: res })
    }
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit()
    }
  }

  get inputClass () {
    if (!this.props.validate || this.state.value === '') {
      return ''
    }

    if (this.props.validate(this.state.value)) {
      return 'valid-input'
    } else {
      return 'invalid-input'
    }
  }

  get isDisabled () {
    if (!this.props.validate) {
      return false
    }

    if (this.state.value === '') {
      return true
    }

    return !this.props.validate(this.state.value)
  }

  render () {
    let {
      onCancel,
      onSubmit,
      onPaste,
      className,
      icon,
      submitText,
      validate,
      defaultValue,
      description,
      title,
      ...props
    } = this.props

    return (
      <Modal {...props} className={className} onCancel={onCancel}>
        <ModalBody title={title} icon={icon}>
          { description &&
            <p className='gray w-80 center'>{description}</p>
          }

          <input
            onChange={this.onChange}
            onPaste={this.onPaste}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            required
            autoFocus
            className={`input-reset charcoal ba b--black-20 pa2 mb2 db w-75 center focus-outline ${this.inputClass}`}
            type='text' />
        </ModalBody>

        <ModalActions>
          <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
          <Button className='ma2' bg='bg-aqua' disabled={this.isDisabled} onClick={this.onSubmit}>{submitText}</Button>
        </ModalActions>
      </Modal>
    )
  }
}

export default TextInputModal

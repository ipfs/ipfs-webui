import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../modal/Modal'

class TextInputModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    title: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    description: PropTypes.node,
    submitText: PropTypes.string,
    validate: PropTypes.func,
    defaultValue: PropTypes.string,
    mustBeDifferent: PropTypes.bool
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

    if (this.props.validate(this.state.value)) {
      return 'b--green-muted focus-outline-green'
    } else {
      return 'b--red-muted focus-outline-red'
    }
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
    let {
      onCancel,
      onChange,
      mustBeDifferent,
      onSubmit,
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
          { description && typeof description === 'object' && description }

          { description && typeof description === 'string' &&
            <p className='gray w-80 center'>{description}</p>
          }

          <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            required
            autoFocus
            className={`input-reset charcoal ba b--black-20 br1 pa2 mb2 db w-75 center focus-outline ${this.inputClass}`}
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

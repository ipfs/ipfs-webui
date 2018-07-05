import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../modal/Modal'

class TextInputModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
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

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit()
    }
  }

  validate = () => this.props.validate(this.state.value)

  render () {
    let {
      onCancel,
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
          { description &&
            <p className='gray w-80 center'>{description}</p>
          }

          { validate && !validate() &&
            <p>Invalid Path</p>
          }

          <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.value}
            required
            autoFocus
            className='input-reset charcoal ba b--black-20 pa2 mb2 db w-75 center focus-outline'
            type='text' />
        </ModalBody>

        <ModalActions>
          <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
          <Button className='ma2' bg='bg-aqua' onClick={this.onSubmit}>{submitText}</Button>
        </ModalActions>
      </Modal>
    )
  }
}

export default TextInputModal

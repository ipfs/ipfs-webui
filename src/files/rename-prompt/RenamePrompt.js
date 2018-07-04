import React from 'react'
import PropTypes from 'prop-types'
import PencilIcon from '../../icons/StrokePencil'
import Prompt from '../prompt/Prompt'

class RenamePrompt extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    filename: PropTypes.string.isRequired,
    folder: PropTypes.bool
  }

  static defaultProps = {
    className: '',
    folder: false
  }

  constructor (props) {
    super(props)
    this.state = { filename: props.filename }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (event) {
    this.setState({ filename: event.target.value })
  }

  handleSubmit (event) {
    this.props.onSubmit(this.state.filename)
    event.preventDefault()
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleSubmit()
    }
  }

  render () {
    let {onCancel, onSubmit, className, filename, folder, ...props} = this.props
    className = `${className} bg-white w-80 shadow-4 sans-serif relative`

    return (
      <Prompt {...props}
        className={className}
        onCancel={onCancel}
        onConfirm={this.handleSubmit}
        confirmText='Save'
        title={`Rename ${folder ? 'Folder' : 'File'}`}
        icon={PencilIcon} >
        <p className='gray w-80 center'>
          Choose a new name for this {folder ? 'folder' : 'file'}.
        </p>

        <input
          onChange={this.handleChange}
          onKeyPress={this.onKeyPress}
          value={this.state.filename}
          required
          autoFocus
          className='input-reset charcoal ba b--black-20 pa2 mb2 db w-75 center focus-outline'
          type='text' />
      </Prompt>
    )
  }
}

export default RenamePrompt

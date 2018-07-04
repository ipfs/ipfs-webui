import React from 'react'
import PropTypes from 'prop-types'
import PencilIcon from '../../icons/StrokePencil'
import Button from '../../components/button/Button'
import { Prompt, PromptActions, PromptBody } from '../prompt/Prompt'

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
  }

  onChange = (event) => {
    this.setState({ filename: event.target.value })
  }

  onSubmit = () => {
    this.props.onSubmit(this.state.filename)
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.onSubmit()
    }
  }

  render () {
    let {onCancel, onSubmit, className, filename, folder, ...props} = this.props
    className = `${className} bg-white w-80 shadow-4 sans-serif relative`

    return (
      <Prompt {...props} className={className} onCancel={onCancel}>
        <PromptBody title={`Rename ${folder ? 'Folder' : 'File'}`} icon={PencilIcon}>
          <p className='gray w-80 center'>
            Choose a new name for this {folder ? 'folder' : 'file'}.
          </p>

          <input
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            value={this.state.filename}
            required
            autoFocus
            className='input-reset charcoal ba b--black-20 pa2 mb2 db w-75 center focus-outline'
            type='text' />
        </PromptBody>

        <PromptActions>
          <Button className='ma2' bg='bg-gray' onClick={onCancel}>Cancel</Button>
          <Button className='ma2' bg='bg-aqua' onClick={this.onSubmit}>Save</Button>
        </PromptActions>
      </Prompt>
    )
  }
}

export default RenamePrompt

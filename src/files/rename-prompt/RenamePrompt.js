import React from 'react'
import PropTypes from 'prop-types'
import PencilIcon from '../../icons/StrokePencil'
import CancelIcon from '../../icons/GlyphSmallCancel'
import Button from '../../components/button/Button'

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
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleChange (event) {
    this.setState({ filename: event.target.value })
  }

  handleSubmit (event) {
    this.props.onSubmit(this.state.filename)
    event.preventDefault()
  }

  handleCancel = (event) => {
    this.props.onCancel()
    event.preventDefault()
  }

  render () {
    let {onCancel, onSubmit, className, filename, folder, ...props} = this.props
    className = `${className} bg-white w-80 shadow-4 sans-serif relative`

    return (
      <form onSubmit={this.handleSubmit} className={className} style={{maxWidth: '30em'}} {...props}>
        <CancelIcon className='absolute pointer w2 h2 top-0 right-0 fill-gray' onClick={this.handleCancel} />

        <div className='ph2 pv3 tc'>
          <div className='center bg-snow br-100 flex justify-center items-center' style={{width: '80px', height: '80px'}}>
            <PencilIcon className='fill-gray w3' />
          </div>

          <p className='charcoal-muted fw5'>Rename {folder ? 'Folder' : 'File'}</p>

          <p className='gray w-80 center'>
            Choose a new name for this {folder ? 'folder' : 'file'}.
          </p>

          <input
            onChange={this.handleChange}
            value={this.state.filename}
            required
            className='input-reset charcoal ba b--black-20 pa2 mb2 db w-75 center'
            type='text' />
        </div>

        <div className='flex justify-between pa2' style={{ backgroundColor: '#f4f6f8' }}>
          <Button className='ma2' type='button' bg='bg-gray' onClick={this.handleCancel}>Cancel</Button>
          <Button className='ma2' bg='bg-aqua'>Save</Button>
        </div>
      </form>
    )
  }
}

export default RenamePrompt

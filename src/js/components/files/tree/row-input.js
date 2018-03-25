import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import Icon from '../../../views/icon'

class CreateDirInput extends Component {
  _onKeyUp = (event) => {
    if (event.which === 13) {
      // Enter key
      event.preventDefault()
      this.props.onKeyEnter()
    } else if (event.which === 27) {
      // Escape key
      event.preventDefault()
      this.props.onKeyEsc()
    }
  }

  componentDidMount () {
    ReactDOM.findDOMNode(this.refs.tmpDirInput).focus()
  }

  render () {
    return (
      <div className='file-row tmp-dir-row'>
        <div className='input'>
          <Icon glyph='folder' large />
          <input
            ref='tmpDirInput'
            type='text'
            value={this.props.value}
            onChange={this.props.onChange}
            onKeyUp={this._onKeyUp}
            onBlur={this.props.onBlur} />
        </div>
      </div>
    )
  }
}

CreateDirInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyEnter: PropTypes.func,
  onKeyEsc: PropTypes.func,
  onBlur: PropTypes.func
}

CreateDirInput.defaultProps = {
  value: '',
  onChange () {},
  onKeyEnter () {},
  onKeyEsc () {},
  onBlur () {}
}

export default CreateDirInput

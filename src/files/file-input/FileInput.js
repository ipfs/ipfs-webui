import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'

export default class FileInput extends React.Component {
  static propTypes = {
    upload: PropTypes.func.isRequired
  }

  onChange = () => {
    this.props.upload(this.input.files)
    this.input.value = null
  }

  onClick = () => {
    this.input.click()
  }

  render () {
    return (
      <div>
        <Button className='f7' onClick={this.onClick}>+ Add to IPFS</Button>
        <input
          type='file'
          className='dn'
          multiple
          ref={(input) => { this.input = input }}
          onChange={this.onChange} />
      </div>
    )
  }
}

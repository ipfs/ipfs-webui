import React from 'react'
import PropTypes from 'prop-types'
import Button from '../../components/button/Button'

export function readAsBuffer (file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader()
    reader.onload = (event) => {
      resolve({
        content: Buffer.from(reader.result),
        name: file.name
      })
    }
    reader.onerror = (event) => {
      reject(reader.error)
    }

    reader.readAsArrayBuffer(file)
  })
}

export default class FileInput extends React.Component {
  static propTypes = {
    upload: PropTypes.func.isRequired
  }

  onChange = () => {
    const raw = this.input.files
    const { upload } = this.props
    let promises = []

    for (const file of raw) {
      promises.push(readAsBuffer(file))
      console.log(file)
    }

    Promise.all(promises)
      .then(files => {
        upload(files)
      })

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

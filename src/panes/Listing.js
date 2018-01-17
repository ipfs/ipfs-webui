import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {
  Pane,
  Header,
  FileBlock,
  IconButton,
  Footer
} from 'ipfs-react-components'

export default class Listing extends Component {
  static propTypes = {
    utility: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    root: PropTypes.string.isRequired
  }

  state = {
    files: []
  }

  componentDidMount () {
    this.props.utility.list(this.props.root)
      .then(res => { this.setState({files: res}) })
  }

  navigate = (name) => {
    this.props.navigate(`/files${this.props.root}${name}`)
  }

  open = (name, hash) => {
    alert('Open ' + name)
    console.log(name)
  }

  copy = (hash) => {
    alert('Copy ' + hash)
    // TODO: COPY TO CLIPBOARD
  }

  render () {
    const files = this.state.files.map((file, index) => {
      return (
        <FileBlock
          name={file.Name}
          key={index}
          open={this.open}
          navigate={this.navigate}
          copy={this.copy}
          type={file.Type}
          hash={file.Hash} />
      )
    })

    const name = this.props.root.split('/').pop() || 'Files'

    return (
      <Pane class='files'>
        <Header title={name} />
        <div className='main'>
          {files}
        </div>
        <Footer>
          <div className='right'>
            <IconButton onClick={() => {}} icon='plus' />
            <IconButton onClick={() => {}} icon='folder' />
          </div>
        </Footer>
      </Pane>
    )
  }
}

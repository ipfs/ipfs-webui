import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {
  Pane,
  Header,
  FileBlock,
  IconButton,
  Footer
} from 'ipfs-react-components'

export default class Files extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    utility: PropTypes.object.isRequired
  }

  state = {
    files: [],
    root: '/'
  }

  constructor (props) {
    super(props)
    let root = props.match.params[0] || '/'
    if (!root.endsWith('/')) {
      root += '/'
    }
    this.state.root = root
  }

  componentDidMount () {
    this.props.utility.list(this.state.root)
      .then(res => { this.setState({files: res}) })
  }

  navigate = (name) => {
    this.props.history.push(`/files${this.state.root}${name}`)
  }

  open = (name, hash) => {
    alert('Open ' + hash)
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

    return (
      <Pane class='peers'>
        <Header title='Files' />
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

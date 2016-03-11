import React from 'react'
import {Row, Col, Nav, NavItem, Panel} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import debug from 'debug'

import FileList from '../views/filelist'
import i18n from '../utils/i18n.js'

const log = debug('pages:files')

export
default class Files extends React.Component {
  state = {
    files: [],
    dragging: false
  };

  static displayName = 'Files';
  static propTypes = {
    ipfs: React.PropTypes.object,
    gateway: React.PropTypes.string,
    location: React.PropTypes.object
  };

  componentDidMount () {
    this.getFiles()
  }

  getFiles () {
    this.props.ipfs.pin.list('recursive', (err, pinned) => {
      if (err || !pinned) return this.error(err)

      this.setState({
        files: Object.keys(pinned.Keys).sort()
      })
    })
  }

  _onAddFile = (event) => {
    event.preventDefault()
    this.refs.fileSelect.click()
  };

  _onDragOver = (event) => {
    event.stopPropagation()
    event.preventDefault()
    this.setState({
      dragging: true
    })
  };

  _onDragLeave = (event) => {
    event.stopPropagation()
    event.preventDefault()
    this.setState({
      dragging: false
    })
  };

  _onDrop = (event) => {
    event.stopPropagation()
    event.preventDefault()
    this.setState({
      dragging: false
    })
    this._onFileChange(event)
  };

  _onFileChange = (event) => {
    const files = event.target.files || event.dataTransfer.files
    if (!files || !files[0]) return
    var file = files[0]
    log('adding file: ', file)

    const add = (data) => {
      this.props.ipfs.add(data, (err, res) => {
        if (err || !res) return this.error(err)
        res = res[0]

        this.setState({
          confirm: res.Name || file.name
        })

        setTimeout(() => this.setState({
          confirm: null
        }), 6000)
      })
    }

    if (file.path) {
      add(file.path)
    } else {
      const reader = new window.FileReader()
      reader.onload = () => {
        let data = reader.result
        data = new Buffer(data.substr(data.indexOf(',') + 1), 'base64')
        add(data)
      }
      // TODO: use array buffers instead of base64 strings
      reader.readAsDataURL(file)
    }

    this.getFiles()
  };

  error (err) {
    console.error(err)
  }

  _renderTitle = () => {
    switch (this.props.location.pathname) {
      case '/files':
        return <h3>{i18n.t('All Local Files')}</h3>
      default:
        return ''
    }
  };

  _renderAdder = () => {
    return (
      <div className='file-add-container'>
        <div
          className={'file-add-target ' + (this.state.dragging ? 'hover' : null)}
          onDragOver={this._onDragOver}
          onDragLeave={this._onDragLeave}
          onDrop={this._onDrop}
        >
        </div>
        <div className={'file-add-container-inner ' + (this.state.dragging ? 'hover' : '')}></div>
        <div className={(this.state.dragging || this.state.confirm) ? 'hidden' : ''}>
          <p>
            <strong>{i18n.t('Drag-and-drop your files here')}</strong>
          </p>
          <p>
            <span>{i18n.t('or')}</span>
          </p>
          <p>
            <button
              className={'btn btn-second add-file ' + (this.state.dragging ? 'hover' : null)}
              onClick={this._onAddFile}
              onDragOver={() => this.setState({dragging: true})}
              onDragLeave={() => this.setState({dragging: false})}
              onDrop={this._onDrop}
            >
              {i18n.t('Select files...')}
            </button>
          </p>
        </div>
        <div className={!this.state.dragging ? 'hidden' : ''}>
          <p>
            <strong>{i18n.t('Drop your file here to add it to IPFS')}</strong>
          </p>
        </div>
        <div className={!this.state.confirm ? 'hidden' : ''}>
          <p>
            <i className='fa fa-lg fa-thumbs-up'></i> {i18n.t('Added')} <strong>{this.state.confirm}</strong>
          </p>
        </div>
        <input
          type='file'
          ref='fileSelect'
          className='file-select'
          style={{display: 'none'}}
          onChange={this._onFileChange}
        />
      </div>
    )
  };

  _renderPanel = () => {
    switch (this.props.location.pathname) {
      case '/files':
        return (
          <Panel bsStyle={'default'}>
            <FileList
              files={this.state.files}
              namesHidden
              ipfs={this.props.ipfs}
              gateway={this.props.gateway}
            />
          </Panel>
        )
      default:
        return ''
    }
  };

  render () {
    return (
      <Row>
        <Col sm={10} smOffset={1}>
          {this._renderAdder()}
          <Nav bsStyle='tabs'>
            <LinkContainer to='/files'>
              <NavItem>{i18n.t('All Files')}</NavItem>
            </LinkContainer>
          </Nav>
          <div className={this.state.selected}>
            {this._renderTitle()}
            {this._renderPanel()}
          </div>
        </Col>
      </Row>
    )
  }
}

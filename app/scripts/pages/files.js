import React from 'react'
import {Row, Col, Nav, NavItem, Panel} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import debug from 'debug'

import FileList from '../views/filelist'
import LocalStorage from '../utils/localStorage'
import i18n from '../utils/i18n.js'

const log = debug('pages:files')

export
default class Files extends React.Component {
  state = {
    files: LocalStorage.get('files') || [],
    pinned: [],
    local: [],
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

  componentWillUnmount () {
    clearInterval(this.pollInterval)
  }

  getFiles = () => {
    this.props.ipfs.pin.list((err, pinned) => {
      if (err || !pinned) return this.error(err)
      this.setState({
        pinned: Object.keys(pinned.Keys).sort()
      })
    })
    this.props.ipfs.pin.list('recursive', (err, pinned) => {
      if (err || !pinned) return this.error(err)
      this.setState({
        local: Object.keys(pinned.Keys).sort()
      })
    })
  };

  addFile (event) {
    event.preventDefault()
    this.refs['file-select'].click()
  }

  onDrop (event) {
    event.stopPropagation()
    event.preventDefault()
    this.setState({
      dragging: false
    })
    this.onFileChange.bind(this, event)
  }

  onFileChange (event) {
    const files = event.target.files || event.dataTransfer.files
    if (!files || !files[0]) return
    var file = files[0]
    log('adding file: ', file)

    const add = data => {
      this.props.ipfs.add(data, (err, res) => {
        if (err || !res) return this.error(err)
        res = res[0]

        const metadata = {
          id: res.Hash,
          name: res.Name || file.name,
          type: file.type,
          size: file.size
        }

        let nextFiles = (this.state.files || [])
        nextFiles.unshift(metadata)
        LocalStorage.set('files', nextFiles)
        this.setState({
          files: nextFiles,
          confirm: metadata.name
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
  }

  error (err) {
    console.error(err)
    // TODO
  }

  _renderTitle = () => {
    switch (this.props.location.pathname) {
      case '/files':
        return this._renderAdder()
      case '/files/pinned':
        return <h3>{i18n.t('Pinned Files')}</h3>
      case '/files/all':
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
          onDragOver={() => this.setState({dragging: true})}
          onDragLeave={() => this.setState({dragging: false})}
          onDrop={this.onDrop.bind(this)}
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
              onClick={this.addFile.bind(this)}
              onDragOver={() => this.setState({dragging: true})}
              onDragLeave={() => this.setState({dragging: false})}
              onDrop={this.onDrop.bind(this)}
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
          ref='file-select'
          className='file-select'
          style={{display: 'none'}}
          onChange={this.onFileChange.bind(this)}
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
                ipfs={this.props.ipfs}
                gateway={this.props.gateway}
            />
          </Panel>
        )
      case '/files/pinned':
        return (
          <Panel bsStyle={'default'}>
            <FileList
                files={this.state.pinned}
                namesHidden
                ipfs={this.props.ipfs}
                gateway={this.props.gateway}
            />
          </Panel>
        )
      case '/files/all':
        return (
          <Panel bsStyle={'default'}>
            <FileList
                files={this.state.local}
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
          <Nav bsStyle='tabs'>
            <LinkContainer to='/files'>
              <NavItem>{i18n.t('Files')}</NavItem>
            </LinkContainer>
            <LinkContainer to='/files/pinned'>
              <NavItem>{i18n.t('Pinned')}</NavItem>
            </LinkContainer>
            <LinkContainer to='/files/all'>
              <NavItem>{i18n.t('All')}</NavItem>
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

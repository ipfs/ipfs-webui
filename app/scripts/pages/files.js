import React from 'react'
import ReactDOM from 'react-dom'
import $ from 'jquery'
import {Row, Col, Nav, NavItem, Panel} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import FileList from '../views/filelist'
import LocalStorage from '../utils/localStorage'
import i18n from '../utils/i18n.js'

export default React.createClass({
  displayName: 'Files',
  propTypes: {
    ipfs: React.PropTypes.object,
    gateway: React.PropTypes.string,
    location: React.PropTypes.object
  },
  getInitialState: function () {
    var t = this

    var files = LocalStorage.get('files') || []

    function getFiles () {
      t.props.ipfs.pin.list(function (err, pinned) {
        if (err || !pinned) return t.error(err)
        t.setState({ pinned: Object.keys(pinned.Keys).sort() })
      })

      t.props.ipfs.pin.list('recursive', function (err, pinned) {
        if (err || !pinned) return t.error(err)
        t.setState({ local: Object.keys(pinned.Keys).sort() })
      })
    }

    getFiles()

    return {
      files: files,
      pinned: [],
      local: [],
      dragging: false
    }
  },

  componentWillUnmount: function () {
    clearInterval(this.pollInterval)
  },

  addFile: function (e) {
    e.preventDefault()
    $(ReactDOM.findDOMNode(this)).find('.file-select').click()
    return
  },

  onDragOver: function (e) {
    console.log('dragover')
    this.setState({ dragging: true })
    $(e.target).addClass('hover')
    e.stopPropagation()
    e.preventDefault()
  },

  onDragLeave: function (e) {
    console.log('dragleave')
    this.setState({ dragging: false })
    $(e.target).removeClass('hover')
    e.stopPropagation()
    e.preventDefault()
  },

  onDrop: function (e) {
    this.setState({ dragging: false })
    $(e.target).removeClass('hover')
    e.stopPropagation()
    e.preventDefault()
    this.onFileChange(e)
  },

  onFileChange: function (e) {
    var files = e.target.files || e.dataTransfer.files
    if (!files || !files[0]) return
    var file = files[0]
    var t = this
    console.log('adding file: ', file)

    function add (data) {
      t.props.ipfs.add(data, function (err, res) {
        if (err || !res) return t.error(err)
        res = res[0]

        var metadata = {
          id: res.Hash,
          name: res.Name || file.name,
          type: file.type,
          size: file.size
        }

        var nextFiles = (t.state.files || [])
        nextFiles.unshift(metadata)
        LocalStorage.set('files', nextFiles)
        t.setState({
          files: nextFiles,
          confirm: metadata.name
        })

        setTimeout(function () {
          t.setState({ confirm: null })
        }, 6000)
      })
    }

    if (file.path) {
      add(file.path)
    } else {
      var reader = new window.FileReader()
      reader.onload = function () {
        var data = reader.result
        data = new Buffer(data.substr(data.indexOf(',') + 1), 'base64')
        add(data)
      }
      // TODO: use array buffers instead of base64 strings
      reader.readAsDataURL(file)
    }
  },

  error: function (err) {
    console.error(err)
    // TODO
  },

  _renderTitle () {
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
  },

  _renderAdder () {
    return (
      <div className='file-add-container'>
        <div
            className='file-add-target'
            onDragOver={this.onDragOver}
            onDragLeave={this.onDragLeave}
            onDrop={this.onDrop}
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
                className='btn btn-second add-file'
                onClick={this.addFile}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}
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
            className='file-select'
            style={{display: 'none'}}
            onChange={this.onFileChange}
        />
      </div>
    )
  },

  _renderPanel () {
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
  },

  render: function () {
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
})

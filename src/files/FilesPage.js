import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import RenameModal from './rename-modal/RenameModal'
import DeleteModal from './delete-modal/DeleteModal'
import Overlay from '../components/overlay/Overlay'
import { join } from 'path'

const action = (name) => {
  return (...args) => {
    console.log(name, args)
  }
}

class FilesPage extends React.Component {
  static propTypes = {
    files: PropTypes.object
  }

  state = {
    downloadReq: null,
    downloadProgress: -1,
    addProgress: null,
    rename: {
      isOpen: false,
      path: '',
      filename: ''
    },
    delete: {
      isOpen: false,
      paths: [],
      files: 0,
      folders: 0
    }
  }

  onLinkClick = (link) => {
    if (this.props.files.type === 'directory') {
      this.filesList.toggleAll(false)
    }

    const {doUpdateHash} = this.props
    link = link.split('/').map(p => encodeURIComponent(p)).join('/')
    doUpdateHash(`/files${link}`)
  }

  onInspect = (data) => {
    const {doUpdateHash} = this.props
    let hash

    if (Array.isArray(data)) {
      hash = data[0].hash
    } else {
      hash = data.hash
    }

    doUpdateHash(`/explore/ipfs/${hash}`)
  }

  onRename = ([file]) => {
    this.setState({
      rename: {
        isOpen: true,
        path: file.path,
        filename: file.path.split('/').pop()
      }
    })
  }

  onRenameCancel = () => {
    this.setState({
      rename: {
        isOpen: false,
        path: '',
        filename: ''
      }
    })
  }

  onRenameSubmit = (newName) => {
    let {filename, path} = this.state.rename

    if (newName !== '' && newName !== filename) {
      this.filesList.toggleOne(filename, false)
      this.props.doFilesRename(path, path.replace(filename, newName))
        .then(() => {
          this.filesList.toggleOne(newName, true)
        })
    }

    this.onRenameCancel()
  }

  onDelete = (files) => {
    let filesCount = 0
    let foldersCount = 0

    files.forEach(file => file.type === 'file' ? filesCount++ : foldersCount++)

    this.setState({
      delete: {
        isOpen: true,
        files: filesCount,
        folders: foldersCount,
        paths: files.map(f => f.path)
      }
    })
  }

  onDeleteCancel = () => {
    this.setState({
      delete: {
        isOpen: false,
        files: 0,
        folders: 0
      }
    })
  }

  onDeleteConfirm = () => {
    this.filesList.toggleAll(false)
    this.props.doFilesDelete(this.state.delete.paths)
    this.onDeleteCancel()
  }

  onAddByPath = (path) => {
    this.props.doFilesAddPath(this.props.files.path, path)
  }

  downloadFile = (sUrl, fileName) => {
    let xhr = new window.XMLHttpRequest()
    let total = 0
    xhr.responseType = 'blob'
    xhr.open('GET', sUrl, true)

    this.setState({ downloadReq: xhr })

    xhr.onload = (e) => {
      this.setState({
        downloadProgress: 100,
        downloadReq: null
      })

      const res = xhr.response
      const blob = new window.Blob([res])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      document.body.appendChild(a)
      a.style = 'display:none'
      a.href = url
      a.download = fileName
      a.click()

      window.URL.revokeObjectURL(url)

      setTimeout(() => {
        this.setState({ downloadProgress: -1 })
      }, 1000)
    }

    xhr.onprogress = (e) => {
      total = e.lengthComputable ? e.total : (total ||
        xhr.getResponseHeader('X-Content-Length') ||
        xhr.getResponseHeader('Content-Length'))

      this.setState({ downloadProgress: (e.loaded / total) * 100 })
    }

    xhr.send()
  }

  onDownload = (files) => {
    if (this.state.downloadReq != null) {
      this.state.downloadReq.abort()
      this.setState({
        downloadProgress: -1,
        downloadReq: null
      })
      return
    }

    this.props.doFilesDownloadLink(files)
      .then(({url, filename}) => this.downloadFile(url, filename))
  }

  onMakeDir = (path) => {
    this.props.doFilesMakeDir(join(this.props.files.path, path))
  }

  onAddFiles = (files) => {
    this.props.doFilesWrite(this.props.files.path, files, (progress) => {
      this.setState({ addProgress: progress })
      if (progress === 100) {
        setTimeout(() => this.setState({ addProgress: null }), 2000)
      }
    })
  }

  render () {
    const {files} = this.props

    return (
      <div data-id='FilesPage'>
        <Helmet>
          <title>Files - IPFS</title>
        </Helmet>
        {files ? (
          <div className='flex items-center justify-between mb4'>
            <Breadcrumbs path={files.path} onClick={this.onLinkClick} />

            <FileInput
              onMakeDir={this.onMakeDir}
              onAddFiles={this.onAddFiles}
              onAddByPath={this.onAddByPath}
              addProgress={this.state.addProgress} />
          </div>
        ) : null}
        {files && files.type === 'directory' ? (
          <FilesList
            maxWidth='calc(100% - 240px)'
            ref={el => { this.filesList = el }}
            root={files.path}
            files={files.files}
            downloadProgress={this.state.downloadProgress}
            onShare={action('Share')}
            onInspect={this.onInspect}
            onRename={this.onRename}
            onDownload={this.onDownload}
            onDelete={this.onDelete}
            onNavigate={(file) => this.onLinkClick(file.path)}
          />
        ) : null }
        {files && files.type === 'file' ? (
          <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
        ) : null }

        <Overlay show={this.state.rename.isOpen} onLeave={this.onRenameCancel}>
          <RenameModal
            className='outline-0'
            filename={this.state.rename.filename}
            onCancel={this.onRenameCancel}
            onSubmit={this.onRenameSubmit} />
        </Overlay>

        <Overlay show={this.state.delete.isOpen} onLeave={this.onDeleteCancel}>
          <DeleteModal
            className='outline-0'
            files={this.state.delete.files}
            folders={this.state.delete.folders}
            onCancel={this.onDeleteCancel}
            onDelete={this.onDeleteConfirm} />
        </Overlay>
      </div>
    )
  }
}

export default connect(
  'doUpdateHash',
  'doFilesDelete',
  'doFilesRename',
  'doFilesWrite',
  'doFilesAddPath',
  'doFilesDownloadLink',
  'doFilesMakeDir',
  'selectFiles',
  'selectGatewayUrl',
  FilesPage
)

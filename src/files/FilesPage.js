import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import RenamePrompt from './rename-prompt/RenamePrompt'
import DeletePrompt from './delete-prompt/DeletePrompt'
import { Modal } from 'react-overlays'

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
    clipboard: [],
    copy: false,
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
    const {doUpdateHash} = this.props
    doUpdateHash(`/files${link}`)
  }

  onInspect = ([file]) => {
    const {doUpdateHash} = this.props
    doUpdateHash(`/explore/ipfs/${file.hash}`)
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
      this.props.doFilesRename(path, path.replace(filename, newName))
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
    this.props.doFilesDelete(this.state.delete.paths)
    this.onDeleteCancel()
  }

  onFilesUpload = (files) => {
    this.props.doFilesWrite(this.props.files.path, files)
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
            <FileInput upload={this.onFilesUpload} />
          </div>
        ) : null}
        {files && files.type === 'directory' ? (
          <FilesList
            maxWidth='calc(100% - 240px)'
            root={files.path}
            files={files.files}
            onShare={action('Share')}
            onInspect={this.onInspect}
            onRename={this.onRename}
            onDownload={action('Download')}
            onDelete={this.onDelete}
            onNavigate={this.onLinkClick}
            onCancelUpload={action('Cancel Upload')}
          />
        ) : null }
        {files && files.type === 'file' ? (
          <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
        ) : null }

        <Modal
          show={this.state.rename.isOpen}
          className='fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around'
          backdropClassName='fixed top-0 left-0 right-0 bottom-0 bg-black o-50'
          onBackdropClick={this.onRenameCancel}
          onEscapeKeyDown={this.onRenameCancel}>
          <RenamePrompt
            filename={this.state.rename.filename}
            onCancel={this.onRenameCancel}
            onSubmit={this.onRenameSubmit} />
        </Modal>

        <Modal
          show={this.state.delete.isOpen}
          className='fixed top-0 left-0 right-0 bottom-0 z-max flex items-center justify-around'
          backdropClassName='fixed top-0 left-0 right-0 bottom-0 bg-black o-50'
          onBackdropClick={this.onDeleteCancel}
          onEscapeKeyDown={this.onDeleteCancel}>
          <DeletePrompt
            files={this.state.delete.files}
            folders={this.state.delete.folders}
            onCancel={this.onDeleteCancel}
            onDelete={this.onDeleteConfirm} />
        </Modal>
      </div>
    )
  }
}

export default connect(
  'doUpdateHash',
  'doFilesDelete',
  'doFilesRename',
  'doFilesWrite',
  'selectFiles',
  'selectGatewayUrl',
  FilesPage
)

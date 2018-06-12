import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'

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
    copy: false
  }

  onLinkClick = (link) => {
    const {doUpdateHash} = this.props
    doUpdateHash(`/files${link}`)
  }

  onInspect = (hash) => {
    const {doUpdateHash} = this.props
    doUpdateHash(`/explore/ipfs/${hash}`)
  }

  onRename = ([path]) => {
    const oldName = path.split('/').pop()
    const newName = window.prompt('Insert the new name:')

    if (newName) {
      this.props.doFilesRename(path, path.replace(oldName, newName))
    }
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
            onDelete={this.props.doFilesDelete}
            onNavigate={this.onLinkClick}
            onCancelUpload={action('Cancel Upload')}
          />
        ) : null }
        {files && files.type === 'file' ? (
          <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
        ) : null }
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

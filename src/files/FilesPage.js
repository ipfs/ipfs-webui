import React from 'react'
import PropTypes from 'prop-types'
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

const empty = (
  <div>
    <h2>It seems a bit lonely here :(</h2>
  </div>
)

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

    if (!files) {
      return <div>
        <h1 data-id='title'>Files</h1>
      </div>
    }

    let body
    if (files.type === 'directory') {
      if (files.files.length === 0) {
        body = empty
      } else {
        body = <FilesList
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
      }
    } else {
      body = <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
    }

    return (
      <div>
        <div className='flex items-center justify-between mb4'>
          <Breadcrumbs path={files.path} onClick={this.onLinkClick} />
          <FileInput upload={this.onFilesUpload} />
        </div>
        {body}
        <h1 data-id='title'>Files</h1>
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

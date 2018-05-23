import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import Button from '../components/button/Button'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'

const action = (name) => {
  return (...args) => {
    console.log(name, args)
  }
}

class FilesPage extends React.Component {
  static propTypes = {
    files: PropTypes.object.isRequired
  }

  onLinkClick = (link) => {
    const {doUpdateHash} = this.props
    doUpdateHash(`/files` + link)
  }

  render () {
    const {files} = this.props

    if (!files) {
      return <div />
    }

    let body
    if (files.type === 'directory') {
      body = <FilesList
        root={files.path}
        files={files.files}
        onShare={action('Share')}
        onInspect={action('Inspect')}
        onRename={action('Rename')}
        onDownload={action('Download')}
        onDelete={action('Delete')}
        onNavigate={this.onLinkClick}
        onCancelUpload={action('Cancel Upload')}
      />
    } else {
      body = <p>File Preview</p>
    }

    return (
      <div>
        <div className='flex items-center justify-between mb4'>
          <Breadcrumbs path={files.path} onClick={this.onLinkClick} />
          <Button className='f7'>+ Add to IPFS</Button>
        </div>
        {body}
        <h1 data-id='title'>Files</h1>
      </div>
    )
  }
}

export default connect(
  'doUpdateHash',
  'selectFiles',
  FilesPage
)

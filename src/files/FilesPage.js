import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import Overlay from '../components/overlay/Overlay'
import ShareModal from './share-modal/ShareModal'
import RenameModal from './rename-modal/RenameModal'
import DeleteModal from './delete-modal/DeleteModal'
import Errors from './errors/Errors'
import downloadFile from './download-file'
import { join } from 'path'

const defaultState = {
  downloadAbort: null,
  downloadProgress: null,
  share: {
    isOpen: false,
    link: ''
  },
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

class FilesPage extends React.Component {
  static propTypes = {
    files: PropTypes.object,
    filesErrors: PropTypes.array.isRequired,
    filesPathFromHash: PropTypes.string,
    filesSorting: PropTypes.object.isRequired,
    writeFilesProgress: PropTypes.number,
    gatewayUrl: PropTypes.string.isRequired,
    navbarWidth: PropTypes.number.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesDelete: PropTypes.func.isRequired,
    doFilesMove: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    doFilesAddPath: PropTypes.func.isRequired,
    doFilesDownloadLink: PropTypes.func.isRequired,
    doFilesMakeDir: PropTypes.func.isRequired,
    doFilesUpdateSorting: PropTypes.func.isRequired
  }

  state = defaultState

  resetState = (field) => this.setState({ [field]: defaultState[field] })

  makeDir = (path) => this.props.doFilesMakeDir(join(this.props.files.path, path))

  componentDidMount () {
    this.props.doFilesFetch()
  }

  componentDidUpdate (prev) {
    const { filesPathFromHash } = this.props

    if (prev.files === null || filesPathFromHash !== prev.filesPathFromHash) {
      this.props.doFilesFetch()
    }
  }

  download = async (files) => {
    const { doFilesDownloadLink } = this.props
    const { downloadProgress, downloadAbort } = this.state

    if (downloadProgress !== null) {
      downloadAbort()
      return
    }

    const updater = (v) => this.setState({ downloadProgress: v })
    const { url, filename } = await doFilesDownloadLink(files)
    const { abort } = await downloadFile(url, filename, updater)
    this.setState({ downloadAbort: abort })
  }

  add = (raw, root = '') => {
    const { files, doFilesWrite } = this.props

    if (root === '') {
      root = files.path
    }

    doFilesWrite(root, raw)
  }

  addByPath = (path) => {
    const { doFilesAddPath, files } = this.props
    doFilesAddPath(files.path, path)
  }

  inspect = (hash) => {
    const { doUpdateHash } = this.props

    if (Array.isArray(hash)) {
      hash = hash[0].hash
    }

    doUpdateHash(`/explore/ipfs/${hash}`)
  }

  showShareModal = (files) => {
    this.setState({
      share: {
        isOpen: true,
        link: 'Generating...'
      }
    })

    this.props.doFilesShareLink(files).then(link => {
      this.setState({
        share: {
          isOpen: true,
          link: link
        }
      })
    })
  }

  showRenameModal = ([file]) => {
    this.setState({
      rename: {
        isOpen: true,
        path: file.path,
        filename: file.path.split('/').pop()
      }
    })
  }

  rename = (newName) => {
    const {filename, path} = this.state.rename
    this.resetState('rename')

    if (newName !== '' && newName !== filename) {
      this.props.doFilesMove([path, path.replace(filename, newName)])
    }
  }

  showDeleteModal = (files) => {
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

  delete = () => {
    const { paths } = this.state.delete

    this.resetState('delete')
    this.props.doFilesDelete(paths)
  }

  render () {
    const {
      files,
      writeFilesProgress,
      navbarWidth,
      doFilesDismissErrors,
      doFilesMove,
      doFilesNavigateTo,
      doFilesUpdateSorting,
      filesErrors: errors,
      filesSorting: sort
    } = this.props

    const {
      share,
      rename,
      delete: deleteModal
    } = this.state

    return (
      <div data-id='FilesPage'>
        <Helmet>
          <title>Files - IPFS</title>
        </Helmet>
        { files &&
          <div>
            <Errors errors={errors} onDismiss={doFilesDismissErrors} />

            <div className='flex flex-wrap'>
              <Breadcrumbs className='mb3' path={files.path} onClick={doFilesNavigateTo} />

              { files.type === 'directory' &&
                <FileInput
                  className='mb3 ml-auto'
                  onMakeDir={this.makeDir}
                  onAddFiles={this.add}
                  onAddByPath={this.addByPath}
                  addProgress={writeFilesProgress} />
              }
            </div>

            { files.type === 'directory' ? (
              <FilesList
                maxWidth={`calc(100% - ${navbarWidth}px)`}
                key={window.encodeURIComponent(files.path)}
                root={files.path}
                sort={sort}
                updateSorting={doFilesUpdateSorting}
                files={files.content}
                upperDir={files.upper}
                downloadProgress={this.state.downloadProgress}
                onShare={this.showShareModal}
                onInspect={this.inspect}
                onDownload={this.download}
                onAddFiles={this.add}
                onRename={this.showRenameModal}
                onDelete={this.showDeleteModal}
                onNavigate={doFilesNavigateTo}
                onMove={doFilesMove}
              />
            ) : (
              <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
            )}
          </div>
        }

        <Overlay show={share.isOpen} onLeave={() => this.resetState('share')}>
          <ShareModal
            className='outline-0'
            link={share.link}
            onLeave={() => this.resetState('share')} />
        </Overlay>

        <Overlay show={rename.isOpen} onLeave={() => this.resetState('rename')}>
          <RenameModal
            className='outline-0'
            filename={rename.filename}
            onCancel={() => this.resetState('rename')}
            onSubmit={this.rename} />
        </Overlay>

        <Overlay show={deleteModal.isOpen} onLeave={() => this.resetState('delete')}>
          <DeleteModal
            className='outline-0'
            files={deleteModal.files}
            folders={deleteModal.folders}
            onCancel={() => this.resetState('delete')}
            onDelete={this.delete} />
        </Overlay>
      </div>
    )
  }
}

export default connect(
  'doUpdateHash',
  'doFilesDelete',
  'doFilesMove',
  'doFilesWrite',
  'doFilesAddPath',
  'doFilesDownloadLink',
  'doFilesShareLink',
  'doFilesMakeDir',
  'doFilesFetch',
  'doFilesDismissErrors',
  'doFilesNavigateTo',
  'doFilesUpdateSorting',
  'selectFiles',
  'selectFilesErrors',
  'selectGatewayUrl',
  'selectWriteFilesProgress',
  'selectNavbarWidth',
  'selectFilesPathFromHash',
  'selectFilesSorting',
  FilesPage
)

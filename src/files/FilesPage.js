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
import downloadFile from './download-file'
import { join } from 'path'

const action = (name) => {
  return (...args) => {
    console.log(name, args)
  }
}

const defaultState = {
  downloadAbort: null,
  downloadProgress: null,
  addProgress: null,
  toggleOne: () => {},
  toggleAll: () => {},
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
    routeInfo: PropTypes.object,
    files: PropTypes.object,
    ipfsReady: PropTypes.bool,
    gatewayUrl: PropTypes.string.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesDelete: PropTypes.func.isRequired,
    doFilesMove: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    doFilesAddPath: PropTypes.func.isRequired,
    doFilesDownloadLink: PropTypes.func.isRequired,
    doFilesMakeDir: PropTypes.func.isRequired
  }

  state = defaultState

  resetState = (field) => this.setState({ [field]: defaultState[field] })

  setTogglers = (toggleOne, toggleAll) => this.setState({ toggleOne, toggleAll })

  makeDir = (path) => this.props.doFilesMakeDir(join(this.props.files.path, path))

  navigate = (path) => {
    const { doFilesFetch, doUpdateHash, files } = this.props

    if (files.type === 'directory') {
      this.state.toggleAll(false)
    }

    let link = path.split('/').map(p => encodeURIComponent(p)).join('/')
    doUpdateHash(`/files${link}`)
    doFilesFetch(path)
  }

  updateFiles = () => {
    const path = decodeURIComponent(this.props.routeInfo.params.path)
    return this.props.doFilesFetch(path)
  }

  componentDidUpdate (prevProps) {
    if (this.props.ipfsReady && prevProps.files === null) {
      this.updateFiles()
    }
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

  rename = async (newName) => {
    const {filename, path} = this.state.rename
    this.resetState('rename')

    if (newName !== '' && newName !== filename) {
      this.state.toggleOne(filename, false)
      await this.props.doFilesMove(path, path.replace(filename, newName))
      await this.updateFiles()
      this.state.toggleOne(newName, true)
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

  delete = async () => {
    this.state.toggleAll(false)
    this.resetState('delete')
    await this.props.doFilesDelete(this.state.delete.paths)
    await this.updateFiles()
  }

  makeUpdater = (field) => (value) => {
    this.setState({ [field]: value })
    if (value === 100) {
      setTimeout(() => this.setState({ [field]: null }), 2000)
    }
  }

  download = async (files) => {
    const { doFilesDownloadLink } = this.props
    const { downloadProgress, downloadAbort } = this.state

    if (downloadProgress !== null) {
      downloadAbort()
      return
    }

    const updater = this.makeUpdater('downloadProgress')
    const { url, filename } = await doFilesDownloadLink(files)
    const { abort } = await downloadFile(url, filename, updater)
    this.setState({ downloadAbort: abort })
  }

  add = async (raw, root = '') => {
    const { files, doFilesWrite } = this.props

    if (root === '') {
      root = files.path
    }

    const updater = this.makeUpdater('addProgress')
    await doFilesWrite(root, raw, updater)
    await this.updateFiles()
  }

  addByPath = async (path) => {
    const { doFilesAddPath, files } = this.props
    await doFilesAddPath(files.path, path)
    await this.updateFiles()
  }

  inspect = (hash) => {
    const { doUpdateHash } = this.props

    if (Array.isArray(hash)) {
      hash = hash[0].hash
    }

    doUpdateHash(`/explore/ipfs/${hash}`)
  }

  render () {
    const { files } = this.props

    return (
      <div data-id='FilesPage'>
        <Helmet>
          <title>Files - IPFS</title>
        </Helmet>
        { files &&
          <div>
            <div className='flex flex-wrap items-center justify-between mb3'>
              <Breadcrumbs className='mb3' path={files.path} onClick={this.navigate} />

              { files.type === 'directory' &&
                <FileInput
                  className='mb3'
                  onMakeDir={this.makeDir}
                  onAddFiles={this.add}
                  onAddByPath={this.addByPath}
                  addProgress={this.state.addProgress} />
              }
            </div>

            { files.type === 'directory' ? (
              <FilesList
                maxWidth='calc(100% - 240px)'
                setTogglers={this.setTogglers}
                root={files.path}
                files={files.files}
                downloadProgress={this.state.downloadProgress}
                onShare={action('Share')}
                onInspect={this.inspect}
                onRename={this.showRenameModal}
                onDownload={this.download}
                onDelete={this.showDeleteModal}
                onAddFiles={this.add}
                onNavigate={this.navigate}
                onMove={this.props.doFilesMove}
              />
            ) : (
              <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} />
            )}
          </div>
        }

        <Overlay show={this.state.rename.isOpen} onLeave={() => this.resetState('rename')}>
          <RenameModal
            className='outline-0'
            filename={this.state.rename.filename}
            onCancel={() => this.resetState('rename')}
            onSubmit={this.rename} />
        </Overlay>

        <Overlay show={this.state.delete.isOpen} onLeave={() => this.resetState('delete')}>
          <DeleteModal
            className='outline-0'
            files={this.state.delete.files}
            folders={this.state.delete.folders}
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
  'doFilesMakeDir',
  'doFilesFetch',
  'selectFiles',
  'selectGatewayUrl',
  'selectIpfsReady',
  'selectRouteInfo',
  FilesPage
)

import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import downloadFile from './download-file'
import { join } from 'path'
import { translate, Trans } from 'react-i18next'
// Components
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import ContextMenu from './context-menu/ContextMenu'
import Overlay from '../components/overlay/Overlay'
import NewFolderModal from './new-folder-modal/NewFolderModal'
import ShareModal from './share-modal/ShareModal'
import RenameModal from './rename-modal/RenameModal'
import DeleteModal from './delete-modal/DeleteModal'
import Button from '../components/button/Button'
import WelcomeInfo from './info/WelcomeInfo'
import CompanionInfo from './info/CompanionInfo'
import AddFilesInfo from './info/AddFilesInfo'
// Icons
import FolderIcon from '../icons/StrokeFolder'

const defaultState = {
  downloadAbort: null,
  downloadProgress: null,
  newFolder: {
    isOpen: false
  },
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
  },
  isContextMenuOpen: false
}

class FilesPage extends React.Component {
  static propTypes = {
    ipfsProvider: PropTypes.string,
    files: PropTypes.object,
    filesErrors: PropTypes.array,
    filesPathFromHash: PropTypes.string,
    filesSorting: PropTypes.object.isRequired,
    writeFilesProgress: PropTypes.number,
    gatewayUrl: PropTypes.string.isRequired,
    doUpdateHash: PropTypes.func.isRequired,
    doFilesDelete: PropTypes.func.isRequired,
    doFilesMove: PropTypes.func.isRequired,
    doFilesWrite: PropTypes.func.isRequired,
    doFilesAddPath: PropTypes.func.isRequired,
    doFilesDownloadLink: PropTypes.func.isRequired,
    doFilesMakeDir: PropTypes.func.isRequired,
    doFilesUpdateSorting: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  state = defaultState

  resetState = (field) => this.setState({ [field]: defaultState[field] })

  makeDir = (path) => {
    this.resetState('newFolder')
    this.props.doFilesMakeDir(join(this.props.files.path, path))
  }

  componentDidMount () {
    this.props.doFilesFetch()
  }

  componentDidUpdate (prev) {
    const { filesPathFromHash } = this.props

    if (prev.files === null || !prev.ipfsConnected || filesPathFromHash !== prev.filesPathFromHash) {
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

  showNewFolderModal = () => {
    this.setState({
      newFolder: {
        isOpen: true
      }
    })
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
        folder: file.type === 'directory',
        isOpen: true,
        path: file.path,
        filename: file.path.split('/').pop()
      }
    })
  }

  rename = (newName) => {
    const { filename, path } = this.state.rename
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

  handleContextMenuClick = (ev) => {
    // This is needed to disable the native OS right-click menu
    // and deal with the clicking on the ContextMenu options
    if (ev !== undefined && typeof ev !== 'string') {
      ev.preventDefault()
    }

    this.setState(state => ({ isContextMenuOpen: !state.isContextMenuOpen }))
  }

  render () {
    const {
      ipfsProvider, files, writeFilesProgress, filesSorting: sort, t,
      doFilesMove, doFilesNavigateTo, doFilesUpdateSorting,
      filesIsMfs
    } = this.props

    const { newFolder, share, rename, delete: deleteModal } = this.state

    const isCompanion = ipfsProvider === 'window.ipfs'
    const filesExist = files && files.content && files.content.length
    const isRoot = files && files.path === '/'

    return (
      <div data-id='FilesPage' className='mw9 center'>
        <Helmet>
          <title>{t('title')} - IPFS</title>
        </Helmet>

        { files &&
          <div>
            <div className='flex flex-wrap items-center mb3'>
              <Breadcrumbs path={files.path} onClick={doFilesNavigateTo} />

              { files.type === 'directory'
                ? (
                  <div className='ml-auto flex items-center'>
                    <Button
                      className='mr3 f6 pointer'
                      color='charcoal-muted'
                      bg='bg-transparent'
                      onClick={() => this.showNewFolderModal()}>
                      <FolderIcon viewBox='10 15 80 80' height='20px' className='fill-charcoal-muted w2 v-mid' />
                      <span className='fw3'>{t('newFolder')}</span>
                    </Button>
                    <FileInput
                      onAddFiles={this.add}
                      onAddByPath={this.addByPath}
                      addProgress={writeFilesProgress} />
                  </div>
                ) : (
                  <div className='ml-auto' style={{ width: '1.5rem' }}> {/* to render correctly in Firefox */}
                    <ContextMenu
                      handleClick={this.handleContextMenuClick}
                      isOpen={this.state.isContextMenuOpen}
                      isMfs={filesIsMfs}
                      onShare={() => this.showShareModal([files])}
                      onDelete={() => this.showDeleteModal([files])}
                      onRename={() => this.showRenameModal([files])}
                      onInspect={() => this.inspect([files])}
                      onDownload={() => this.download([files])}
                      hash={files.hash} />
                  </div>
                )}
            </div>

            { isRoot && isCompanion && <CompanionInfo /> }

            { isRoot && !filesExist && !isCompanion && <AddFilesInfo /> }

            { isRoot && !filesExist && <WelcomeInfo t={t} /> }

            { files.type === 'directory'
              ? <FilesList
                key={window.encodeURIComponent(files.path)}
                root={files.path}
                sort={sort}
                updateSorting={doFilesUpdateSorting}
                files={files.content}
                upperDir={files.upper}
                downloadProgress={this.state.downloadProgress}
                isMfs={filesIsMfs}
                onShare={this.showShareModal}
                onInspect={this.inspect}
                onDownload={this.download}
                onAddFiles={this.add}
                onRename={this.showRenameModal}
                onDelete={this.showDeleteModal}
                onNavigate={doFilesNavigateTo}
                onMove={doFilesMove} />
                : <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} /> }
          </div>
        }

        <Overlay show={newFolder.isOpen} onLeave={() => this.resetState('newFolder')}>
          <NewFolderModal
            className='outline-0'
            onCancel={() => this.resetState('newFolder')}
            onSubmit={this.makeDir} />
        </Overlay>

        <Overlay show={share.isOpen} onLeave={() => this.resetState('share')}>
          <ShareModal
            className='outline-0'
            link={share.link}
            onLeave={() => this.resetState('share')} />
        </Overlay>

        <Overlay show={rename.isOpen} onLeave={() => this.resetState('rename')}>
          <RenameModal
            className='outline-0'
            folder={rename.folder}
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
  'selectIpfsConnected',
  'selectIpfsProvider',
  'doUpdateHash',
  'doFilesDelete',
  'doFilesMove',
  'doFilesWrite',
  'doFilesAddPath',
  'doFilesDownloadLink',
  'doFilesShareLink',
  'doFilesMakeDir',
  'doFilesFetch',
  'doFilesNavigateTo',
  'doFilesUpdateSorting',
  'selectFiles',
  'selectGatewayUrl',
  'selectWriteFilesProgress',
  'selectFilesPathFromHash',
  'selectFilesIsMfs',
  'selectFilesSorting',
  translate('files')(FilesPage)
)

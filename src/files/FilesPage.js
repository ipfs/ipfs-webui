import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { join } from 'path'
import { translate, Trans } from 'react-i18next'
import ReactJoyride, { STATUS } from 'react-joyride'
// Lib
import { filesTour } from '../lib/tours'
import downloadFile from './download-file'
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
import AboutIpfs from '../components/about-ipfs/AboutIpfs'
import Box from '../components/box/Box'
import Button from '../components/button/Button'
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

  handleClickStart = e => {
    e.preventDefault()

    this.setState({
      run: true
    })
  }

  handleJoyrideCallback = data => {
    const { status, type } = data

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      this.setState({ run: false })
    }

    console.groupCollapsed(type)
    console.log(data)
    console.groupEnd()
  }

  render () {
    const {
      ipfsProvider, files, writeFilesProgress, filesSorting: sort, t,
      doFilesMove, doFilesNavigateTo, doFilesUpdateSorting, toursEnabled
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
              <Breadcrumbs className='joyride-files-breadcrumbs' path={files.path} onClick={doFilesNavigateTo} />

              { files.type === 'directory'
                ? <div className='ml-auto flex items-center'>
                  <Button
                    className='mr3 f6 pointer joyride-files-folder'
                    color='charcoal-muted'
                    bg='bg-transparent'
                    onClick={() => this.showNewFolderModal()}>
                    <FolderIcon viewBox='10 15 80 80' height='20px' className='fill-charcoal-muted w2 v-mid' />
                    <span className='fw3'>{t('newFolder')}</span>
                  </Button>
                  <FileInput
                    className='joyride-files-add'
                    onAddFiles={this.add}
                    onAddByPath={this.addByPath}
                    addProgress={writeFilesProgress} />
                </div>
                : <div className='ml-auto' style={{ width: '1.5rem' }}> {/* to render correctly in Firefox */}
                  <ContextMenu
                    handleClick={this.handleContextMenuClick}
                    isOpen={this.state.isContextMenuOpen}
                    onShare={() => this.showShareModal(files.extra)}
                    onDelete={() => this.showDeleteModal(files.extra)}
                    onRename={() => this.showRenameModal(files.extra)}
                    onInspect={() => this.inspect(files.extra)}
                    onDownload={() => this.download(files.extra)}
                    hash={files.stats.hash} />
                </div> }
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

        <ReactJoyride
          run={toursEnabled}
          steps={filesTour.steps}
          styles={filesTour.styles}
          callback={this.handleJoyrideCallback}
          continuous
          scrollToFirstStep
          showProgress />
      </div>
    )
  }
}

const CompanionInfo = () => (
  <div className='mv4 tc navy f5' >
    <Box style={{ background: 'rgba(105, 196, 205, 0.1)' }}>
      <Trans i18nKey='companionInfo'>
        <p className='ma0'>As you are using <strong>IPFS Companion</strong>, the files view is limited to files added while using the extension.</p>
      </Trans>
    </Box>
  </div>
)

const AddFilesInfo = () => (
  <div className='mv4 tc navy f5' >
    <Box style={{ background: 'rgba(105, 196, 205, 0.1)' }}>
      <Trans i18nKey='addFilesInfo'>
        <p className='ma0'>Add files to your local IPFS node by clicking the <strong>Add to IPFS</strong> button above.</p>
      </Trans>
    </Box>
  </div>
)

const WelcomeInfo = ({ t }) => (
  <div className='flex'>
    <div className='flex-auto pr3 lh-copy mid-gray'>
      <Box>
        <h1 className='mt0 mb3 montserrat fw4 f4 charcoal'>{t('welcomeInfo.header')}</h1>
        <Trans i18nKey='welcomeInfo.paragraph1'>
          <p className='f5'><a href='#/' className='link blue u b'>Check the status</a> of your node, it's Peer ID and connection info, the network traffic and the number of connected peers.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph2'>
          <p className='f5'>Easily <a href='#/files' className='link blue b'>manage files</a> in your IPFS repo. You can drag and drop to add files, move and rename them, delete, share or download them.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph3'>
          <p className='f5'>You can <a href='#/explore' className='link blue b'>explore IPLD data</a> that underpins how IPFS works.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph4'>
          <p className='f5'>See all of your <a href='#/peers' className='link blue b'>connected peers</a>, geolocated by their IP address.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph5'>
          <p className='mb4 f5'><a href='#/settings' className='link blue b'>Review the settings</a> for your IPFS node, and update them to better suit your needs.</p>
        </Trans>
        <Trans i18nKey='welcomeInfo.paragraph6'>
          <p className='mb0 f5'>If you want to help push the Web UI forward, <a href='https://github.com/ipfs-shipyard/ipfs-webui' className='link blue'>check out its code</a> or <a href='https://github.com/ipfs-shipyard/ipfs-webui/issues' className='link blue'>report a bug</a>!</p>
        </Trans>
      </Box>
    </div>
    <div className='measure lh-copy dn db-l flex-none mid-gray f6' style={{ maxWidth: '40%' }}>
      <AboutIpfs />
    </div>
  </div>
)

export default connect(
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
  'selectFilesSorting',
  'selectToursEnabled',
  translate('files')(FilesPage)
)

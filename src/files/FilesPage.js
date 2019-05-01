import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import downloadFile from './download-file'
import { translate } from 'react-i18next'
// Components
import Breadcrumbs from './breadcrumbs/Breadcrumbs'
import FilesList from './files-list/FilesList'
import FilePreview from './file-preview/FilePreview'
import FileInput from './file-input/FileInput'
import ContextMenu from './context-menu/ContextMenu'
import Button from '../components/button/Button'
import AddFilesInfo from './info-boxes/AddFilesInfo'
import CompanionInfo from './info-boxes/CompanionInfo'
import WelcomeInfo from './info-boxes/WelcomeInfo'
import Modals, { DELETE, NEW_FOLDER, SHARE, RENAME } from './modals/Modals'
// Icons
import GlyphDots from '../icons/GlyphDots'
import FolderIcon from '../icons/StrokeFolder'

const defaultState = {
  downloadAbort: null,
  downloadProgress: null,
  modals: {
    show: null,
    files: null
  },
  contextMenu: {
    isOpen: false,
    translateX: 0,
    translateY: 0,
    file: null
  },
  isContextMenuOpen: false
}

class FilesPage extends React.Component {
  constructor (props) {
    super(props)
    this.contextMenuRef = React.createRef()
  }

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
    this.setState({ modals: { show: NEW_FOLDER } })
  }

  showShareModal = (files) => {
    this.setState({ modals: { show: SHARE, files } })
  }

  showRenameModal = (files) => {
    this.setState({ modals: { show: RENAME, files } })
  }

  showDeleteModal = (files) => {
    this.setState({ modals: { show: DELETE, files } })
  }

  resetModals = () => {
    this.setState({ modals: { } })
  }

  handleContextMenu = (ev, clickType, file, dotsPosition) => {
    // This is needed to disable the native OS right-click menu
    // and deal with the clicking on the ContextMenu options
    if (ev !== undefined && typeof ev !== 'string') {
      ev.preventDefault()
      ev.persist()
    }

    const ctxMenu = findDOMNode(this.contextMenuRef.current)
    const ctxMenuPosition = ctxMenu.getBoundingClientRect()

    let translateX = 0
    let translateY = 0

    if (clickType === 'RIGHT') {
      const rightPadding = window.innerWidth - ctxMenu.parentNode.getBoundingClientRect().right
      translateX = (window.innerWidth - ev.clientX) - rightPadding - 15
      translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - ev.clientY - 10
    } else {
      translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - (dotsPosition && dotsPosition.y) - 30
    }

    this.setState({
      contextMenu: {
        isOpen: !this.state.contextMenu.isOpen,
        translateX,
        translateY,
        file
      }
    })
  }

  handleSingleClick = (ev) => {
    const dotsPosition = this.dotsWrapper.getBoundingClientRect()
    this.handleContextMenu(ev, 'LEFT', this.props.files, dotsPosition)
  }

  render () {
    const {
      ipfsProvider, files, writeFilesProgress, filesSorting: sort, t,
      doFilesMove, doFilesNavigateTo, doFilesUpdateSorting
    } = this.props

    const { contextMenu } = this.state

    const isCompanion = ipfsProvider === 'window.ipfs'
    const filesExist = files && files.content && files.content.length
    const isRoot = files && files.path === '/'

    return (
      <div data-id='FilesPage' className='mw9 center'>
        <Helmet>
          <title>{t('title')} - IPFS</title>
        </Helmet>

        <ContextMenu
          ref={this.contextMenuRef}
          isOpen={contextMenu.isOpen}
          translateX={contextMenu.translateX}
          translateY={contextMenu.translateY}
          handleClick={this.handleContextMenu}
          isUpperDir={contextMenu.file && contextMenu.file.name === '..'}
          showDots={false}
          onShare={() => this.showShareModal([contextMenu.file])}
          onDelete={() => this.showDeleteModal([contextMenu.file])}
          onRename={() => this.showRenameModal([contextMenu.file])}
          onInspect={() => this.inspect([contextMenu.file])}
          onDownload={() => this.download([contextMenu.file])}
          hash={contextMenu.file && contextMenu.file.hash} />

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
                  <div ref={el => { this.dotsWrapper = el }} className='ml-auto' style={{ width: '1.5rem' }}> {/* to render correctly in Firefox */}
                    <GlyphDots className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.handleSingleClick} />
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
                onShare={this.showShareModal}
                onInspect={this.inspect}
                onDownload={this.download}
                onAddFiles={this.add}
                onRename={this.showRenameModal}
                onDelete={this.showDeleteModal}
                onNavigate={doFilesNavigateTo}
                onMove={doFilesMove}
                handleContextMenuClick={this.handleContextMenu} />
              : <FilePreview {...files} gatewayUrl={this.props.gatewayUrl} /> }
          </div>
        }

        <Modals done={this.resetModals} root={files ? files.path : null} { ...this.state.modals } />
      </div>
    )
  }
}

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
  translate('files')(FilesPage)
)

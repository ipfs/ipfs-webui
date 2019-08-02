import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { translate, Trans } from 'react-i18next'
import ReactJoyride from 'react-joyride'
// Lib
import { filesTour } from '../lib/tours'
import downloadFile from './download-file'
// Components
import ContextMenu from './context-menu/ContextMenu'
import withTour from '../components/tour/withTour'
import InfoBoxes from './info-boxes/InfoBoxes'
import FilePreview from './file-preview/FilePreview'
import FilesList from './files-list/FilesList'
// Icons
import Modals, { DELETE, NEW_FOLDER, SHARE, RENAME, ADD_BY_PATH } from './modals/Modals'
import Header from './header/Header'

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
  }
}

class FilesPage extends React.Component {
  constructor (props) {
    super(props)
    this.contextMenuRef = React.createRef()
  }

  state = defaultState

  componentDidMount () {
    this.props.doFilesFetch()
    this.props.doPinsFetch()
  }

  componentDidUpdate (prev) {
    const { filesPathInfo } = this.props

    if (prev.files === null || !prev.ipfsConnected || filesPathInfo.path !== prev.filesPathInfo.path) {
      this.props.doFilesFetch()
    }
  }

  onDownload = async (files) => {
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

  onAddFiles = (raw, root = '') => {
    if (root === '') {
      root = this.props.files.path
    }

    this.props.doFilesWrite(raw, root)
  }

  onAddByPath = (path) => {
    this.props.doFilesAddPath(this.props.files.path, path)
  }

  onInspect = (hash) => {
    this.props.doUpdateHash(`/explore/ipfs/${hash}`)
  }

  showModal = (modal, files = null) => {
    this.setState({ modals: { show: modal, files: files } })
  }

  hideModal = () => {
    this.setState({ modals: { } })
  }

  handleContextMenu = (ev, clickType, file, pos) => {
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

    switch (clickType) {
      case 'RIGHT':
        const rightPadding = window.innerWidth - ctxMenu.parentNode.getBoundingClientRect().right
        translateX = (window.innerWidth - ev.clientX) - rightPadding - 20
        translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - ev.clientY - 10
        break
      case 'TOP':
        const pagePositions = ctxMenu.parentNode.getBoundingClientRect()
        translateX = pagePositions.right - pos.right
        translateY = -(pos.bottom - pagePositions.top + 11)
        break
      default:
        translateX = 1
        translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - (pos && pos.y) - 30
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

  get mainView () {
    const { files } = this.props

    if (!files) {
      return (<div></div>)
    }

    if (files.type !== 'directory') {
      return (
        <FilePreview {...files} />
      )
    }

    return (
      <FilesList
        key={window.encodeURIComponent(files.path)}
        root={files.path}
        updateSorting={this.props.doFilesUpdateSorting}
        files={files.content}
        upperDir={files.upper}
        downloadProgress={this.state.downloadProgress}
        onShare={(files) => this.showModal(SHARE, files)}
        onRename={(files) => this.showModal(RENAME, files)}
        onDelete={(files) => this.showModal(DELETE, files)}
        onInspect={this.onInspect}
        onDownload={this.onDownload}
        onAddFiles={this.onAddFiles}
        onNavigate={this.props.doFilesNavigateTo}
        onMove={this.props.doFilesMove}
        handleContextMenuClick={this.handleContextMenu} />
    )
  }

  get title () {
    const { filesPathInfo, t } = this.props
    const parts = []

    if (filesPathInfo) {
      parts.push(filesPathInfo.realPath)
    }

    if (filesPathInfo.isMfs) {
      parts.push(t('files'))
    } else if (filesPathInfo.isPins) {
      parts.push(t('pins'))
    }

    parts.push('IPFS')
    return parts.join(' - ')
  }

  render () {
    const {
      files, filesPathInfo, ipfsProvider, writeFilesProgress, filesSorting: sort, t,
      doFilesMove, doFilesNavigateTo, doFilesUpdateSorting,
      toursEnabled, handleJoyrideCallback
    } = this.props

    const { newFolder, share, rename, delete: deleteModal, contextMenu } = this.state

    const isCompanion = ipfsProvider === 'window.ipfs'
    const filesExist = files && files.content && files.content.length
    const isRoot = files && files.path === '/'

    return (
      <div data-id='FilesPage' className='mw9 center'>
        <Helmet>
          <title>{this.title}</title>
        </Helmet>

        {/* <Breadcrumbs className='joyride-files-breadcrumbs' path={files.path} onClick={doFilesNavigateTo} /> */}

        <ContextMenu
          ref={this.contextMenuRef}
          isOpen={contextMenu.isOpen}
          translateX={contextMenu.translateX}
          translateY={contextMenu.translateY}
          handleClick={this.handleContextMenu}
          isUpperDir={contextMenu.file && contextMenu.file.name === '..'}
          isMfs={filesPathInfo ? filesPathInfo.isMfs : false}
          pinned={contextMenu.file && contextMenu.file.pinned}
          showDots={false}
          hash={contextMenu.file && contextMenu.file.hash}
          onShare={() => this.showModal(SHARE, [contextMenu.file])}
          onDelete={() => this.showModal(DELETE, [contextMenu.file])}
          onRename={() => this.showModal(RENAME, [contextMenu.file])}
          onInspect={() => this.onInspect(contextMenu.file.hash)}
          onDownload={() => this.onDownload([contextMenu.file])}
          onPin={() => this.props.doFilesPin(contextMenu.file.hash)}
          onUnpin={() => this.props.doFilesUnpin(contextMenu.file.hash)} />

        <Header
          className='joyride-files-add'
          files={files}
          onNavigate={this.props.doFilesNavigateTo}
          onAddFiles={this.onAddFiles}
          onAddByPath={(files) => this.showModal(ADD_BY_PATH, files)}
          onNewFolder={(files) => this.showModal(NEW_FOLDER, files)}
          handleContextMenu={(...args) => this.handleContextMenu(...args, true)} />

        { this.mainView }

        <InfoBoxes isRoot={filesPathInfo.isMfs && filesPathInfo.isRoot}
          isCompanion={this.props.ipfsProvider === 'window.ipfs'}
          filesExist={!!(files && files.content && files.content.length)} />

        <Modals
          done={this.hideModal}
          root={files ? files.path : null}
          onMove={this.props.doFilesMove}
          onMakeDir={this.props.doFilesMakeDir}
          onShareLink={this.props.doFilesShareLink}
          onDelete={this.props.doFilesDelete}
          onAddByPath={this.onAddByPath}
          { ...this.state.modals } />

        <ReactJoyride
          run={toursEnabled}
          steps={filesTour.getSteps({ t, Trans })}
          styles={filesTour.styles}
          callback={handleJoyrideCallback}
          continuous
          scrollToFirstStep
          showProgress />
      </div>
    )
  }
}

FilesPage.propTypes = {
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired,
  ipfsConnected: PropTypes.bool,
  ipfsProvider: PropTypes.string,
  files: PropTypes.object,
  filesPathInfo: PropTypes.object,
  doUpdateHash: PropTypes.func.isRequired,
  doPinsFetch: PropTypes.func.isRequired,
  doFilesFetch: PropTypes.func.isRequired,
  doFilesMove: PropTypes.func.isRequired,
  doFilesMakeDir: PropTypes.func.isRequired,
  doFilesShareLink: PropTypes.func.isRequired,
  doFilesDelete: PropTypes.func.isRequired,
  doFilesAddPath: PropTypes.func.isRequired,
  doFilesNavigateTo: PropTypes.func.isRequired,
  doFilesPin: PropTypes.func.isRequired,
  doFilesUnpin: PropTypes.func.isRequired,
  doFilesUpdateSorting: PropTypes.func.isRequired,
  doFilesWrite: PropTypes.func.isRequired,
  doFilesDownloadLink: PropTypes.func.isRequired
}

export default connect(
  'selectIpfsProvider',
  'selectIpfsConnected',
  'selectFiles',
  'selectFilesPathInfo',
  'doUpdateHash',
  'doPinsFetch',
  'doFilesFetch',
  'doFilesMove',
  'doFilesMakeDir',
  'doFilesShareLink',
  'doFilesDelete',
  'doFilesAddPath',
  'doFilesNavigateTo',
  'doFilesPin',
  'doFilesUnpin',
  'doFilesUpdateSorting',
  'selectGatewayUrl',
  'selectWriteFilesProgress',
  'selectFilesSorting',
  'selectToursEnabled',
  'doFilesWrite',
  'doFilesDownloadLink',
  withTour(translate('files')(FilesPage))
)

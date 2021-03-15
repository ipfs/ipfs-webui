import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
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
import { getJoyrideLocales } from '../helpers/i8n'

// Icons
import Modals, { DELETE, NEW_FOLDER, SHARE, RENAME, ADD_BY_PATH, CLI_TUTOR_MODE, PINNING } from './modals/Modals'
import Header from './header/Header'
import FileImportStatus from './file-import-status/FileImportStatus'

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
    this.props.doFilesSizeGet()
    this.props.doFetchPinningServices().then(() => this.props.doFetchRemotePins())
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
    const { url, filename, method } = await doFilesDownloadLink(files)
    const { abort } = await downloadFile(url, filename, updater, method)
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

  onInspect = (cid) => {
    this.props.doUpdateHash(`/explore/ipfs/${cid}`)
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
      case 'RIGHT': {
        const rightPadding = window.innerWidth - ctxMenu.parentNode.getBoundingClientRect().right
        translateX = (window.innerWidth - ev.clientX) - rightPadding - 20
        translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - ev.clientY - 10
        break
      }
      case 'TOP': {
        const pagePositions = ctxMenu.parentNode.getBoundingClientRect()
        translateX = pagePositions.right - pos.right
        translateY = -(pos.bottom - pagePositions.top + 11)
        break
      }
      default: {
        translateX = 1
        translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - (pos && pos.y) - 30
      }
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
    const { t, files, remotePins, doExploreUserProvidedPath } = this.props

    if (!files) {
      return (<div/>)
    }

    if (files.type === 'unknown') {
      const path = files.path.startsWith('/pins')
        ? files.path.slice(6)
        : files.path

      return (
        <div>
          <Trans i18nKey='cidNotFileNorDir' t={t}>
            The current link isn't a file, nor a directory. Try to <button className='link blue pointer' onClick={() => doExploreUserProvidedPath(path)}>inspect</button> it instead.
          </Trans>
        </div>
      )
    }

    if (files.type === 'file') {
      return (
        <FilePreview {...files} onDownload={() => this.onDownload([files])} />
      )
    }

    return (
      <FilesList
        key={window.encodeURIComponent(files.path)}
        updateSorting={this.props.doFilesUpdateSorting}
        files={files.content}
        remotePins={remotePins}
        upperDir={files.upper}
        downloadProgress={this.state.downloadProgress}
        onShare={(files) => this.showModal(SHARE, files)}
        onRename={(files) => this.showModal(RENAME, files)}
        onDelete={(files) => this.showModal(DELETE, files)}
        onSetPinning={(files) => this.showModal(PINNING, files)}
        onInspect={this.onInspect}
        onRemotePinClick={this.onRemotePinClick}
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
      parts.push(t('app:terms.files'))
    } else if (filesPathInfo.isPins) {
      parts.push(t('app:terms.pins'))
    }

    parts.push('IPFS')
    return parts.join(' | ')
  }

  render () {
    const {
      t, files, filesPathInfo, toursEnabled, handleJoyrideCallback, isCliTutorModeEnabled,
      doSetCliOptions, cliOptions
    } = this.props
    const { contextMenu } = this.state

    return (
      <div data-id='FilesPage' className='mw9 center'>
        <Helmet>
          <title>{this.title}</title>
        </Helmet>

        <ContextMenu
          autofocus
          ref={this.contextMenuRef}
          isOpen={contextMenu.isOpen}
          translateX={contextMenu.translateX}
          translateY={contextMenu.translateY}
          handleClick={this.handleContextMenu}
          isMfs={filesPathInfo ? filesPathInfo.isMfs : false}
          isUnknown={!!(contextMenu.file && contextMenu.file.type === 'unknown')}
          pinned={contextMenu.file && contextMenu.file.pinned}
          cid={contextMenu.file && contextMenu.file.cid}
          onShare={() => this.showModal(SHARE, [contextMenu.file])}
          onDelete={() => this.showModal(DELETE, [contextMenu.file])}
          onRename={() => this.showModal(RENAME, [contextMenu.file])}
          onInspect={() => this.onInspect(contextMenu.file.cid)}
          onDownload={() => this.onDownload([contextMenu.file])}
          onPinning={() => this.showModal(PINNING, [contextMenu.file])}
          isCliTutorModeEnabled={isCliTutorModeEnabled}
          onCliTutorMode={() => this.showModal(CLI_TUTOR_MODE, [contextMenu.file])}
          doSetCliOptions={doSetCliOptions}
        />

        <Header
          files={files}
          onNavigate={this.props.doFilesNavigateTo}
          onAddFiles={this.onAddFiles}
          onMove={this.props.doFilesMove}
          onAddByPath={(files) => this.showModal(ADD_BY_PATH, files)}
          onNewFolder={(files) => this.showModal(NEW_FOLDER, files)}
          onCliTutorMode={() => this.showModal(CLI_TUTOR_MODE)}
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
          onPinningSet={this.props.doSetPinning}
          cliOptions={cliOptions}
          { ...this.state.modals } />

        <FileImportStatus />

        <ReactJoyride
          run={toursEnabled}
          steps={filesTour.getSteps({ t, Trans })}
          styles={filesTour.styles}
          callback={handleJoyrideCallback}
          continuous
          scrollToFirstStep
          locale={getJoyrideLocales(t)}
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
  doFilesUpdateSorting: PropTypes.func.isRequired,
  doFilesWrite: PropTypes.func.isRequired,
  doFilesDownloadLink: PropTypes.func.isRequired
}

export default connect(
  'selectIpfsProvider',
  'selectIpfsConnected',
  'selectFiles',
  'selectRemotePins',
  'selectFilesPathInfo',
  'doUpdateHash',
  'doPinsFetch',
  'doFetchPinningServices',
  'doFetchRemotePins',
  'doFilesFetch',
  'doFilesMove',
  'doFilesMakeDir',
  'doFilesShareLink',
  'doFilesDelete',
  'doFilesAddPath',
  'doFilesNavigateTo',
  'doFilesUpdateSorting',
  'selectFilesSorting',
  'selectToursEnabled',
  'doFilesWrite',
  'doFilesDownloadLink',
  'doExploreUserProvidedPath',
  'doFilesSizeGet',
  'selectIsCliTutorModeEnabled',
  'selectIsCliTutorModalOpen',
  'doOpenCliTutorModal',
  'doSetCliOptions',
  'selectCliOptions',
  'doSetPinning',
  withTour(withTranslation('files')(FilesPage))
)

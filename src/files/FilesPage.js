import React, { useEffect, useRef, useState } from 'react'
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

const FilesPage = ({
  doFetchPinningServices, doFilesFetch, doPinsFetch, doFilesSizeGet, doFilesDownloadLink, doFilesWrite, doFilesAddPath, doUpdateHash,
  doFilesUpdateSorting, doFilesNavigateTo, doFilesMove, doSetCliOptions, doFetchRemotePins, remotePins, doExploreUserProvidedPath,
  ipfsProvider, ipfsConnected, doFilesMakeDir, doFilesShareLink, doFilesDelete, doSetPinning, onRemotePinClick,
  files, filesPathInfo, pinningServices, toursEnabled, handleJoyrideCallback, isCliTutorModeEnabled, cliOptions, t
}) => {
  const contextMenuRef = useRef()
  const [downloadAbort, setDownloadAbort] = useState(null)
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [modals, setModals] = useState({ show: null, files: null })
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    translateX: 0,
    translateY: 0,
    file: null
  })

  useEffect(() => {
    doFetchPinningServices()
    doFilesFetch()
    doPinsFetch()
    doFilesSizeGet()
  }, [doFetchPinningServices, doFilesFetch, doPinsFetch, doFilesSizeGet])

  useEffect(() => {
    if (ipfsConnected || filesPathInfo.path) {
      doFilesFetch()
    }
  }, [ipfsConnected, filesPathInfo, doFilesFetch])

  /* TODO: uncomment below if we ever want automatic remote pin check
  *  (it was disabled for now due to https://github.com/ipfs/ipfs-desktop/issues/1954)
  useEffect(() => {
    files && files.content && doFetchRemotePins(files.content)
  }, [files, pinningServices, doFetchRemotePins])
  */

  const onDownload = async (files) => {
    if (downloadProgress !== null) {
      return downloadAbort()
    }

    const updater = (v) => setDownloadProgress(v)
    const { url, filename, method } = await doFilesDownloadLink(files)
    const { abort } = await downloadFile(url, filename, updater, method)
    setDownloadAbort(() => abort)
  }
  const onAddFiles = (raw, root = '') => {
    if (root === '') root = files.path

    doFilesWrite(raw, root)
  }

  const onAddByPath = (path, name) => doFilesAddPath(files.path, path, name)
  const onInspect = (cid) => doUpdateHash(`/explore/ipfs/${cid}`)
  const showModal = (modal, files = null) => setModals({ show: modal, files: files })
  const hideModal = () => setModals({})
  const handleContextMenu = (ev, clickType, file, pos) => {
    // This is needed to disable the native OS right-click menu
    // and deal with the clicking on the ContextMenu options
    if (ev !== undefined && typeof ev !== 'string') {
      ev.preventDefault()
      ev.persist()
    }

    const ctxMenu = findDOMNode(contextMenuRef.current)
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

    setContextMenu({
      isOpen: !contextMenu.isOpen,
      translateX,
      translateY,
      file
    })
  }

  const MainView = ({ t, files, remotePins, doExploreUserProvidedPath }) => {
    if (!files) return (<div/>)

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
        <FilePreview {...files} onDownload={() => onDownload([files])} />
      )
    }

    return (
      <FilesList
        key={window.encodeURIComponent(files.path)}
        updateSorting={doFilesUpdateSorting}
        files={files.content}
        remotePins={remotePins}
        upperDir={files.upper}
        downloadProgress={downloadProgress}
        onShare={(files) => showModal(SHARE, files)}
        onRename={(files) => showModal(RENAME, files)}
        onRemove={(files) => showModal(DELETE, files)}
        onSetPinning={(files) => showModal(PINNING, files)}
        onInspect={onInspect}
        onRemotePinClick={onRemotePinClick}
        onDownload={onDownload}
        onAddFiles={onAddFiles}
        onNavigate={doFilesNavigateTo}
        onMove={doFilesMove}
        handleContextMenuClick={handleContextMenu} />
    )
  }

  const getTitle = (filesPathInfo, t) => {
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

  return (
    <div data-id='FilesPage' className='mw9 center'>
      <Helmet>
        <title>{getTitle(filesPathInfo, t)}</title>
      </Helmet>

      <ContextMenu
        autofocus
        ref={contextMenuRef}
        isOpen={contextMenu.isOpen}
        translateX={contextMenu.translateX}
        translateY={contextMenu.translateY}
        handleClick={handleContextMenu}
        isMfs={filesPathInfo ? filesPathInfo.isMfs : false}
        isUnknown={!!(contextMenu.file && contextMenu.file.type === 'unknown')}
        pinned={contextMenu.file && contextMenu.file.pinned}
        cid={contextMenu.file && contextMenu.file.cid}
        onShare={() => showModal(SHARE, [contextMenu.file])}
        onRemove={() => showModal(DELETE, [contextMenu.file])}
        onRename={() => showModal(RENAME, [contextMenu.file])}
        onInspect={() => onInspect(contextMenu.file.cid)}
        onDownload={() => onDownload([contextMenu.file])}
        onPinning={() => showModal(PINNING, [contextMenu.file])}
        isCliTutorModeEnabled={isCliTutorModeEnabled}
        onCliTutorMode={() => showModal(CLI_TUTOR_MODE, [contextMenu.file])}
        doSetCliOptions={doSetCliOptions}
      />

      <Header
        files={files}
        onNavigate={doFilesNavigateTo}
        onAddFiles={onAddFiles}
        onMove={doFilesMove}
        onAddByPath={(files) => showModal(ADD_BY_PATH, files)}
        onNewFolder={(files) => showModal(NEW_FOLDER, files)}
        onCliTutorMode={() => showModal(CLI_TUTOR_MODE)}
        handleContextMenu={(...args) => handleContextMenu(...args, true)} />

      <MainView t={t} files={files} remotePins={remotePins} doExploreUserProvidedPath={doExploreUserProvidedPath}/>

      <InfoBoxes isRoot={filesPathInfo.isMfs && filesPathInfo.isRoot}
        isCompanion={ipfsProvider === 'window.ipfs'}
        filesExist={!!(files && files.content && files.content.length)} />

      <Modals
        done={hideModal}
        root={files ? files.path : null}
        onMove={doFilesMove}
        onMakeDir={doFilesMakeDir}
        onShareLink={doFilesShareLink}
        onRemove={doFilesDelete}
        onAddByPath={onAddByPath}
        onPinningSet={doSetPinning}
        cliOptions={cliOptions}
        { ...modals } />

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

export default connect(
  'selectIpfsProvider',
  'selectIpfsConnected',
  'selectFiles',
  'selectRemotePins',
  'selectFilesPathInfo',
  'doUpdateHash',
  'doPinsFetch',
  'doFetchPinningServices',
  'selectPinningServices',
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

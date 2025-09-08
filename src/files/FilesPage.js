import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { findDOMNode } from 'react-dom'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import ReactJoyride from 'react-joyride'
// Lib
import { filesTour } from '../lib/tours.js'
// Components
import ContextMenu from './context-menu/ContextMenu.js'
import withTour from '../components/tour/withTour.js'
import InfoBoxes from './info-boxes/InfoBoxes.js'
import FilePreview from './file-preview/FilePreview.js'
import FilesList from './files-list/FilesList.js'
import FilesGrid from './files-grid/files-grid.js'
import { ViewList, ViewModule } from '../icons/stroke-icons.js'
import FileNotFound from './file-not-found/index.tsx'
import { getJoyrideLocales } from '../helpers/i8n.js'

// Icons
import Modals, { DELETE, NEW_FOLDER, SHARE, ADD_BY_CAR, RENAME, ADD_BY_PATH, BULK_CID_IMPORT, SHORTCUTS, CLI_TUTOR_MODE, PINNING, PUBLISH } from './modals/Modals.js'

import Header from './header/Header.js'
import FileImportStatus from './file-import-status/FileImportStatus.js'
import { useExplore } from 'ipld-explorer-components/providers'
import SelectedActions from './selected-actions/SelectedActions.js'
import Checkbox from '../components/checkbox/Checkbox.js'

const FilesPage = ({
  doFetchPinningServices, doFilesFetch, doPinsFetch, doFilesSizeGet, doFilesDownloadLink, doFilesDownloadCarLink, doFilesWrite, doAddCarFile, doFilesBulkCidImport, doFilesAddPath, doUpdateHash,
  doFilesUpdateSorting, doFilesNavigateTo, doFilesMove, doSetCliOptions, doFetchRemotePins, remotePins, pendingPins, failedPins,
  ipfsProvider, ipfsConnected, doFilesMakeDir, doFilesShareLink, doFilesCopyCidProvide, doFilesDelete, doSetPinning, onRemotePinClick, doPublishIpnsKey,
  files, filesPathInfo, pinningServices, toursEnabled, handleJoyrideCallback, isCliTutorModeEnabled, cliOptions, t
}) => {
  const { doExploreUserProvidedPath } = useExplore()
  const contextMenuRef = useRef()
  const [modals, setModals] = useState({ show: null, files: null })
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    translateX: 0,
    translateY: 0,
    file: null
  })
  const [viewMode, setViewMode] = useState('list')
  const [selected, setSelected] = useState([])

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === '?' && e.shiftKey) {
        e.preventDefault()
        showModal(SHORTCUTS)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  /* TODO: uncomment below if we ever want automatic remote pin check
  *  (it was disabled for now due to https://github.com/ipfs/ipfs-desktop/issues/1954)
  useEffect(() => {
    files && files.content && doFetchRemotePins(files.content)
  }, [files, pinningServices, doFetchRemotePins])
  */

  const onDownload = async (files) => {
    const url = await doFilesDownloadLink(files)
    window.location.href = url
  }

  const onDownloadCar = async (files) => {
    const url = await doFilesDownloadCarLink(files)
    window.location.href = url
  }

  const onAddFiles = (raw, root = '') => {
    if (root === '') root = files.path

    doFilesWrite(raw, root)
  }

  const onBulkCidImport = (raw, root = '') => {
    if (root === '') root = files.path

    doFilesBulkCidImport(raw, root)
  }

  const onClosePreview = useCallback(() => {
    // if the parentPath is / or null then we are at the root of the files page, (preview close button shouldn't even be visible in this case)
    if (files?.parentPath == null || files?.parentPath === '/') return

    doUpdateHash(files?.parentPath)
  }, [files?.parentPath, doUpdateHash])

  const onAddByPath = (path, name) => doFilesAddPath(files.path, path, name)
  /**
   *
   * @param {File} file
   * @param {string} name
   */
  const onAddByCar = (file, name) => {
    doAddCarFile(files.path, file, name)
  }
  const onInspect = (cid) => doUpdateHash(`/explore/${cid}`)
  const showModal = (modal, files = null) => setModals({ show: modal, files })
  const hideModal = () => setModals({})
  /**
   * @param {React.MouseEvent} ev
   * @param {string} clickType
   * @param {ContextMenuFile} file
   * @param {Pick<DOMRect, 'y' | 'right' | 'bottom'>} [pos]
   */
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

  const MainView = ({ t, files, remotePins, pendingPins, failedPins, doExploreUserProvidedPath }) => {
    const selectedFiles = useMemo(() =>
      selected
        .map(name => files?.content?.find(el => el.name === name))
        .filter(n => n)
        .map(file => ({
          ...file,
          pinned: files?.pins?.map(p => p.toString())?.includes(file.cid.toString())
        }))
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    , [files?.content, files?.pins, selected])

    if (!files || files.type === 'file') return (<div/>)

    if (files.type === 'unknown') {
      const path = files.path

      return (
        <div>
          <Trans i18nKey='cidNotFileNorDir' t={t}>
            The current link isn't a file, nor a directory. Try to <button className='link blue pointer' onClick={() => doExploreUserProvidedPath(path)}>inspect</button> it instead.
          </Trans>
        </div>
      )
    }
    if (files.type === 'not-found') {
      return <FileNotFound path={files.path} />
    }

    const commonProps = {
      key: window.encodeURIComponent(files.path),
      updateSorting: doFilesUpdateSorting,
      files: files.content || [],
      pins: files.pins || [],
      remotePins: remotePins || [],
      pendingPins: pendingPins || [],
      failedPins: failedPins || [],
      filesPathInfo,
      selected,
      modalOpen: modals.show !== null,
      onSelect: (name, isSelected) => {
        if (Array.isArray(name)) {
          if (isSelected) {
            setSelected(name)
          } else {
            setSelected([])
          }
        } else {
          if (isSelected) {
            setSelected(prev => [...prev, name])
          } else {
            setSelected(prev => prev.filter(n => n !== name))
          }
        }
      },
      onShare: (files) => showModal(SHARE, files),
      onRename: (files) => showModal(RENAME, files),
      onRemove: (files) => showModal(DELETE, files),
      onSetPinning: (files) => showModal(PINNING, files),
      onInspect,
      onRemotePinClick,
      onDownload,
      onAddFiles,
      onNavigate: doFilesNavigateTo,
      onMove: doFilesMove,
      handleContextMenuClick: handleContextMenu,
      // TODO: Implement this
      onDismissFailedPin: () => {}
    }

    return <>
      {viewMode === 'list'
        ? <FilesList {...commonProps} />
        : <FilesGrid {...commonProps} />}

      {selectedFiles.length !== 0 && <SelectedActions
        className={'fixed bottom-0 right-0'}
        style={{
          zIndex: 20
        }}
        animateOnStart={selectedFiles.length === 1}
        unselect={() => setSelected([])}
        remove={() => showModal(DELETE, selectedFiles)}
        rename={() => showModal(RENAME, selectedFiles)}
        share={() => showModal(SHARE, selectedFiles)}
        setPinning={() => showModal(PINNING, selectedFiles)}
        download={() => onDownload(selectedFiles)}
        inspect={() => onInspect(selectedFiles[0].cid)}
        count={selectedFiles.length}
        isMfs={filesPathInfo.isMfs}
        size={selectedFiles.reduce((a, b) => a + (b.size || 0), 0)} />
      }
    </>
  }

  const getTitle = (filesPathInfo, t) => {
    const parts = []

    if (filesPathInfo) {
      parts.push(filesPathInfo.realPath)
    }

    if (filesPathInfo.isMfs) {
      parts.push(t('app:terms.files'))
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
        onDownloadCar={() => onDownloadCar([contextMenu.file])}
        onPinning={() => showModal(PINNING, [contextMenu.file])}
        onPublish={() => showModal(PUBLISH, [contextMenu.file])}
        onCopyCid={(cid) => doFilesCopyCidProvide(cid)}
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
        onAddByCar={(files) => showModal(ADD_BY_CAR, files)}
        onBulkCidImport={(files) => showModal(BULK_CID_IMPORT, files)}
        onNewFolder={(files) => showModal(NEW_FOLDER, files)}
        onCliTutorMode={() => showModal(CLI_TUTOR_MODE)}
        handleContextMenu={(...args) => handleContextMenu(...args, true)}
      >
        <div className="flex items-center justify-end">
          <button
            className={`pointer filelist-view ${viewMode === 'list' ? 'selected-item' : 'gray'}`}
            onClick={() => setViewMode('list')}
            title={t('viewList')}
            style={{
              height: '24px'
            }}
          >
            <ViewList width="24" height="24" />
          </button>
          <button
            className={`pointer filegrid-view ${viewMode === 'grid' ? 'selected-item' : 'gray'}`}
            onClick={() => setViewMode('grid')}
            title={t('viewGrid')}
            style={{
              height: '24px'
            }}
          >
            <ViewModule width="24" height="24" />
          </button>
        </div>
      </Header>

      {(files && files.type !== 'file') && <div className="flex items-center justify-between">
        <div>
          {viewMode === 'grid' && files?.content?.length > 0
            ? (
                <Checkbox
                  className='pv3 pl3 pr1 bg-white flex-none'
                  onChange={(checked) => {
                    if (checked) {
                      setSelected(files.content.map(f => f.name))
                    } else {
                      setSelected([])
                    }
                  }}
                  checked={files?.content?.length > 0 && selected.length === files.content.length}
                  label={<span className='fw5 f6'>{t('selectAllEntries')}</span>}
                />
              )
            : null
          }
        </div>
      </div>}

      <MainView t={t} files={files} remotePins={remotePins} pendingPins={pendingPins} failedPins={failedPins} doExploreUserProvidedPath={doExploreUserProvidedPath}/>

      <Preview files={files} onDownload={() => onDownload([files])} onClose={onClosePreview} />

      <InfoBoxes isRoot={filesPathInfo.isMfs && filesPathInfo.isRoot}
        isCompanion={false}
        filesExist={!!(files && files.content && files.content.length)} />

      <Modals
        done={hideModal}
        root={files ? files.path : null}
        onMove={doFilesMove}
        onMakeDir={doFilesMakeDir}
        onShareLink={doFilesShareLink}
        onRemove={doFilesDelete}
        onAddByPath={onAddByPath}
        onAddByCar={onAddByCar}
        onBulkCidImport={onBulkCidImport}
        onPinningSet={doSetPinning}
        onPublish={doPublishIpnsKey}
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

const Preview = ({ files, onDownload, onClose }) => {
  if (files && files.type === 'file') {
    return (<FilePreview {...files} onDownload={onDownload} onClose={onClose} />)
  }
  return (<div/>)
}

export default connect(
  'selectIpfsProvider',
  'selectIpfsConnected',
  'selectFiles',
  'selectRemotePins',
  'selectPendingPins',
  'selectFailedPins',
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
  'doFilesCopyCidProvide',
  'doFilesDelete',
  'doFilesAddPath',
  'doAddCarFile',
  'doFilesNavigateTo',
  'doFilesUpdateSorting',
  'selectFilesSorting',
  'selectToursEnabled',
  'doFilesWrite',
  'doFilesBulkCidImport',
  'doFilesDownloadLink',
  'doFilesDownloadCarLink',
  'doFilesSizeGet',
  'selectIsCliTutorModeEnabled',
  'selectIsCliTutorModalOpen',
  'doOpenCliTutorModal',
  'doSetCliOptions',
  'selectCliOptions',
  'doSetPinning',
  'doPublishIpnsKey',
  withTour(withTranslation('files')(FilesPage))
)

import React, { useRef, useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Trans, withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { normalizeFiles } from '../../lib/files.js'
import GridFile from './grid-file.js'
import { connect } from 'redux-bundler-react'
import './files-grid.css'

const FilesGrid = ({
  files, pins = [], remotePins = [], pendingPins = [], failedPins = [], filesPathInfo, t,
  onShare, onInspect, onDownload, onRemove, onRename, onNavigate, onAddFiles,
  onMove, handleContextMenuClick, filesIsFetching, onSetPinning, onDismissFailedPin, selected = [], onSelect
}) => {
  const [focused, setFocused] = useState(null)
  const filesRefs = useRef({})
  const gridRef = useRef()

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: NativeTypes.FILE,
    drop: (_, monitor) => {
      if (monitor.didDrop()) return
      const { filesPromise } = monitor.getItem()
      addFiles(filesPromise, onAddFiles)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: filesPathInfo?.isMfs
    })
  })

  const addFiles = async (filesPromise, onAddFiles) => {
    const files = await filesPromise
    onAddFiles(normalizeFiles(files))
  }

  const handleSelect = useCallback((fileName, isSelected) => {
    onSelect(fileName, isSelected)
  }, [onSelect])

  const keyHandler = useCallback((e) => {
    const focusedFile = focused == null ? null : files.find(el => el.name === focused)

    if (e.key === 'Escape' || e.keyCode === 27) {
      onSelect([], false)
      setFocused(null)
      return
    }

    if ((e.key === 'F2' || e.keyCode === 113) && focusedFile != null) {
      return onRename([focusedFile])
    }

    if ((e.key === 'Delete' || e.keyCode === 46 || e.key === 'Backspace' || e.keyCode === 8) && selected.length > 0) {
      const selectedFiles = files.filter(f => selected.includes(f.name))
      return onRemove(selectedFiles)
    }

    if ((e.key === ' ' || e.keyCode === 32) && focusedFile != null) {
      e.preventDefault()
      return handleSelect(focusedFile.name, !selected.includes(focusedFile.name))
    }

    if (((e.key === 'Enter' || e.keyCode === 13) ||
        ((e.key === 'ArrowRight' || e.keyCode === 39) && e.metaKey)) &&
        focusedFile != null) {
      return onNavigate({ path: focusedFile.path, cid: focusedFile.cid })
    }

    const isArrowKey = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key) || (e.keyCode >= 37 && e.keyCode <= 40)

    if (isArrowKey) {
      e.preventDefault()
      const columns = Math.floor((gridRef.current?.clientWidth || window.innerWidth) / 220)
      const currentIndex = files.findIndex(el => el.name === focusedFile?.name)
      let newIndex = currentIndex

      switch (e.key ?? e.keyCode) {
        case 'ArrowDown':
        case 40:
          if (currentIndex === -1) {
            newIndex = files.length - 1 // if no focused file, set to last file
          } else {
            newIndex = currentIndex + columns
          }
          break
        case 'ArrowUp':
        case 38:
          if (currentIndex === -1) {
            newIndex = 0 // if no focused file, set to first file
          } else {
            newIndex = currentIndex - columns
          }
          break
        case 'ArrowRight':
        case 39:
          if (currentIndex === -1) {
            newIndex = files.length - 1 // if no focused file, set to last file
          } else {
            newIndex = currentIndex + 1
          }
          break
        case 'ArrowLeft':
        case 37:
          if (currentIndex === -1) {
            newIndex = 0 // if no focused file, set to first file
          } else {
            newIndex = currentIndex - 1
          }
          break
        default:
          break
      }

      if (newIndex >= 0 && newIndex < files.length) {
        const name = files[newIndex].name
        setFocused(name)
        const element = filesRefs.current[name]
        if (element && element.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          const checkbox = element.querySelector('input[type="checkbox"]')
          if (checkbox) checkbox.focus()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, focused])

  useEffect(() => {
    if (filesIsFetching) return
    document.addEventListener('keyup', keyHandler)
    return () => {
      document.removeEventListener('keyup', keyHandler)
    }
  }, [keyHandler, filesIsFetching])

  const gridClassName = `files-grid${isOver && canDrop ? ' files-grid--drop-target' : ''}`

  return (
    <div ref={(el) => {
      drop(el)
      gridRef.current = el
    }} className={gridClassName}>
      {files.map(file => (
        <GridFile
          key={file.name}
          {...file}
          selected={selected.includes(file.name)}
          focused={focused === file.name}
          pinned={pins?.includes(file.cid?.toString())}
          isRemotePin={remotePins?.includes(file.cid?.toString())}
          isPendingPin={pendingPins?.includes(file.cid?.toString())}
          isFailedPin={failedPins?.some(p => p?.includes(file.cid?.toString()))}
          isMfs={filesPathInfo?.isMfs}
          onShare={onShare}
          onInspect={onInspect}
          onDownload={onDownload}
          onRemove={onRemove}
          onRename={onRename}
          onNavigate={onNavigate}
          onAddFiles={onAddFiles}
          onMove={onMove}
          onSetPinning={onSetPinning}
          onDismissFailedPin={onDismissFailedPin}
          handleContextMenuClick={handleContextMenuClick}
          onSelect={handleSelect}
          ref={el => { filesRefs.current[file.name] = el }}
        />
      ))}
      {files.length === 0 && (
        <Trans i18nKey='filesList.noFiles' t={t}>
          <div className='pv3 b--light-gray files-grid-empty bt tc gray f6'>
            There are no available files. Add some!
          </div>
        </Trans>
      )}
    </div>
  )
}

FilesGrid.propTypes = {
  files: PropTypes.array.isRequired,
  pins: PropTypes.array,
  remotePins: PropTypes.array,
  pendingPins: PropTypes.array,
  failedPins: PropTypes.array,
  filesPathInfo: PropTypes.object,
  selected: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onRename: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onSetPinning: PropTypes.func.isRequired,
  onDismissFailedPin: PropTypes.func.isRequired,
  handleContextMenuClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

FilesGrid.defaultProps = {
  pins: [],
  remotePins: [],
  pendingPins: [],
  failedPins: [],
  filesPathInfo: {},
  selected: []
}

export default connect(
  'selectPins',
  'selectPinningServices',
  'doFetchRemotePins',
  'selectFilesIsFetching',
  'selectFilesSorting',
  'selectFilesPathInfo',
  'selectShowLoadingAnimation',
  'doDismissFailedPin',
  withTranslation('files')(FilesGrid)
)

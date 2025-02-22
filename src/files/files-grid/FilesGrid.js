import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { normalizeFiles } from '../../lib/files.js'
import GridFile from './GridFile.js'
import { connect } from 'redux-bundler-react'
import './FilesGrid.css'

const FilesGrid = ({
  files, pins = [], remotePins = [], pendingPins = [], failedPins = [], filesPathInfo, t,
  onShare, onInspect, onDownload, onRemove, onRename, onNavigate, onAddFiles,
  onMove, handleContextMenuClick, onSetPinning, onDismissFailedPin, selected = [], onSelect
}) => {
  const [focused, setFocused] = useState(null)
  const [firstVisibleRow] = useState(0)
  const filesRefs = useRef({})
  const listRef = useRef()

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

  const handleSelect = (fileName, isSelected) => {
    onSelect(fileName, isSelected)
  }

  const toggleOne = (name, check) => {
    if (check) {
      onSelect(name, true)
    } else {
      onSelect(name, false)
    }
  }

  const keyHandler = (e) => {
    const focusedFile = files.find(el => el.name === focused)

    if (e.key === 'Escape') {
      onSelect([], false)
      setFocused(null)
      return
    }

    if (e.key === 'F2' && focused !== null) {
      return onRename([focusedFile])
    }

    if (e.key === 'Delete' && selected.length > 0) {
      const selectedFiles = files.filter(f => selected.includes(f.name))
      return onRemove(selectedFiles)
    }

    if (e.key === ' ' && focused !== null) {
      e.preventDefault()
      return toggleOne(focused, !selected.includes(focused))
    }

    if ((e.key === 'Enter' || (e.key === 'ArrowRight' && e.metaKey)) && focused !== null) {
      return onNavigate({ path: focusedFile.path, cid: focusedFile.cid })
    }

    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      let index = 0

      if (focused !== null) {
        const prev = files.findIndex(el => el.name === focused)
        const columns = Math.floor(window.innerWidth / 220)

        switch (e.key) {
          case 'ArrowDown':
            index = prev + columns
            break
          case 'ArrowUp':
            index = prev - columns
            break
          case 'ArrowRight':
            index = prev + 1
            break
          case 'ArrowLeft':
            index = prev - 1
            break
          default:
            break
        }
      }

      if (index >= 0 && index < files.length) {
        const name = files[index].name
        setFocused(name)
        const element = filesRefs.current[name]
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.querySelector('input[type="checkbox"]').focus()
        }
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keyup', keyHandler)
    return () => document.removeEventListener('keyup', keyHandler)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [files, focused, selected])

  const gridClassName = `files-grid${isOver && canDrop ? ' files-grid--drop-target' : ''}`

  return (
    <div ref={drop} className={gridClassName}>
      {files.map(file => (
        <GridFile
          key={file.name}
          {...file}
          files={files}
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
          filesRefs={filesRefs}
          firstVisibleRow={firstVisibleRow}
          listRef={listRef}
          ref={el => { filesRefs.current[file.name] = el }}
        />
      ))}
      {files.length === 0 && (
        <div className="files-grid-empty">
          <p>{t('noFiles')}</p>
        </div>
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

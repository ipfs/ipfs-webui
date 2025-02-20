import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { normalizeFiles } from '../../lib/files.js'
import GridFile from './GridFile.js'
import './FilesGrid.css'

const FilesGrid = ({
  files, pins = [], remotePins = [], pendingPins = [], failedPins = [], filesPathInfo, t,
  onShare, onInspect, onDownload, onRemove, onRename, onNavigate, onAddFiles,
  onMove, handleContextMenuClick, onSetPinning, onDismissFailedPin
}) => {
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

  const gridClassName = `files-grid${isOver && canDrop ? ' files-grid--drop-target' : ''}`

  return (
    <div ref={drop} className={gridClassName}>
      {files.map(file => (
        <GridFile
          key={file.name}
          {...file}
          pinned={pins?.includes(file.cid)}
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
  filesPathInfo: {}
}

export default withTranslation('files')(FilesGrid)

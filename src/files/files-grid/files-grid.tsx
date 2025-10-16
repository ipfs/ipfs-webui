import React, { useRef, useState, useEffect, useCallback, type FC, type MouseEvent } from 'react'
import { Trans, withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { normalizeFiles } from '../../lib/files.js'
import GridFile from './grid-file.jsx'
import { connect } from 'redux-bundler-react'
import './files-grid.css'
import { TFunction } from 'i18next'
import type { ContextMenuFile, ExtendedFile, FileStream } from '../types'
import type { CID } from 'multiformats/cid'

export interface FilesGridProps {
  files: ContextMenuFile[]
  pins: string[]
  remotePins: string[]
  pendingPins: string[]
  failedPins: string[]
}

type SetPinningProps = { cid: CID, pinned: boolean }

interface FilesGridPropsConnected extends FilesGridProps {
  filesPathInfo: { isMfs: boolean, isRoot: boolean }
  t: TFunction
  onRemove: (files: ContextMenuFile[]) => void
  onRename: (files: ContextMenuFile[]) => void
  onNavigate: (props: { path: string, cid: CID }) => void
  onAddFiles: (files: FileStream[]) => void
  onMove: (src: string, dst: string) => void
  onSetPinning: (props: SetPinningProps[]) => void
  onDismissFailedPin: (cid?: CID) => void
  handleContextMenuClick: (e: MouseEvent, clickType: string, file: ContextMenuFile, pos?: { x: number, y: number }) => void
  onSelect: (fileName: string | string[], isSelected: boolean) => void
  filesIsFetching: boolean
  selected: string[]
  modalOpen: boolean
}

const FilesGrid = ({
  files, pins = [], remotePins = [], pendingPins = [], failedPins = [], filesPathInfo, t, onRemove, onRename, onNavigate, onAddFiles,
  onMove, handleContextMenuClick, filesIsFetching, onSetPinning, onDismissFailedPin, selected = [], onSelect, modalOpen = false
}: FilesGridPropsConnected) => {
  const [focused, setFocused] = useState<string | null>(null)
  const filesRefs = useRef<Record<string, HTMLDivElement>>({})
  const gridRef = useRef<HTMLDivElement | null>(null)

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

  const addFiles = async (filesPromise: Promise<ExtendedFile[]>, onAddFiles: (files: FileStream[]) => void) => {
    const files = await filesPromise
    onAddFiles(normalizeFiles(files))
  }

  const handleSelect = useCallback((fileName: string, isSelected: boolean) => {
    onSelect(fileName, isSelected)
  }, [onSelect])

  const keyHandler = useCallback((e: KeyboardEvent) => {
    // Don't handle keyboard events when a modal is open
    if (modalOpen) {
      return
    }

    const focusedFile = focused == null ? null : files.find(el => el.name === focused)

    gridRef.current?.focus?.()

    if (e.key === 'Escape') {
      onSelect([], false)
      setFocused(null)
      return
    }

    if ((e.key === 'F2') && focusedFile != null) {
      return onRename([focusedFile])
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && selected.length > 0) {
      const selectedFiles = files.filter(f => selected.includes(f.name))
      return onRemove(selectedFiles)
    }

    if ((e.key === ' ') && focusedFile != null) {
      e.preventDefault()
      handleSelect(focusedFile.name, !selected.includes(focusedFile.name))
      return
    }

    if (focusedFile != null && ((e.key === 'Enter') || (e.key === 'ArrowRight' && e.metaKey) || (e.key === 'NumpadEnter'))) {
      return onNavigate({ path: focusedFile.path, cid: focusedFile.cid })
    }

    const isArrowKey = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)

    if (isArrowKey) {
      e.preventDefault()
      const columns = Math.floor((gridRef.current?.clientWidth || window.innerWidth) / 220)
      const currentIndex = files.findIndex(el => el.name === focusedFile?.name)
      let newIndex = currentIndex

      switch (e.key) {
        case 'ArrowDown':
          if (currentIndex === -1) {
            newIndex = files.length - 1 // if no focused file, set to last file
          } else {
            newIndex = currentIndex + columns
          }
          break
        case 'ArrowUp':
          if (currentIndex === -1) {
            newIndex = 0 // if no focused file, set to first file
          } else {
            newIndex = currentIndex - columns
          }
          break
        case 'ArrowRight':
          if (currentIndex === -1 || currentIndex === files.length - 1) {
            newIndex = 0 // if no focused file, set to last file
          } else {
            newIndex = currentIndex + 1
          }
          break
        case 'ArrowLeft':
          if (currentIndex === -1 || currentIndex === 0) {
            newIndex = files.length - 1 // if no focused file, set to last file
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
          const checkbox: HTMLInputElement | null = element.querySelector('input[type="checkbox"]')
          if (checkbox != null) checkbox.focus()
        }
      }
    }
  }, [files, focused, selected, onSelect, onRename, onRemove, onNavigate, handleSelect, modalOpen])

  useEffect(() => {
    if (filesIsFetching) return
    document.addEventListener('keydown', keyHandler)
    return () => {
      document.removeEventListener('keydown', keyHandler)
    }
  }, [keyHandler, filesIsFetching])

  const gridClassName = `files-grid${isOver && canDrop ? ' files-grid--drop-target' : ''}`

  return (
    <div ref={(el) => {
      drop(el)
      gridRef.current = el
    }} className={gridClassName} tabIndex={0} role="grid" aria-label={t('filesGridLabel')}>
      {files.map(file => (
        <GridFile
          key={file.name}
          {...file}
          refSetter={(r: HTMLDivElement | null) => { filesRefs.current[file.name] = r as HTMLDivElement }}
          selected={selected.includes(file.name)}
          focused={focused === file.name}
          pinned={pins?.includes(file.cid?.toString())}
          isRemotePin={remotePins?.includes(file.cid?.toString())}
          isPendingPin={pendingPins?.includes(file.cid?.toString())}
          isFailedPin={failedPins?.some(p => p?.includes(file.cid?.toString()))}
          isMfs={filesPathInfo?.isMfs}
          onNavigate={() => onNavigate({ path: file.path, cid: file.cid })}
          onAddFiles={onAddFiles}
          onMove={onMove}
          onSetPinning={onSetPinning}
          onDismissFailedPin={onDismissFailedPin}
          handleContextMenuClick={handleContextMenuClick}
          onSelect={handleSelect}
        />
      ))}
      {files.length === 0 && !filesPathInfo?.isRoot && (
        <Trans i18nKey='filesList.noFiles' t={t}>
          <div className='pv3 b--light-gray files-grid-empty bt tc charcoal-muted f6 noselect'>
            There are no available files. Add some!
          </div>
        </Trans>
      )}
    </div>
  )
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
) as FC<FilesGridProps>

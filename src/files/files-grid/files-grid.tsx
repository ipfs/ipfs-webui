import { useRef, useState, useEffect, useCallback, type FC, type MouseEvent } from 'react'
import { Trans, withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { ExtendedFile, FileStream, normalizeFiles } from '../../lib/files.js'
import GridFile from './grid-file.jsx'
// @ts-expect-error - redux-bundler-react is not typed
import { connect } from 'redux-bundler-react'
import './files-grid.css'
import { TFunction } from 'i18next'
import type { ContextMenuFile } from 'src/files/types.js'
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
  filesPathInfo: { isMfs: boolean }
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
}

const FilesGrid = ({
  files, pins = [], remotePins = [], pendingPins = [], failedPins = [], filesPathInfo, t, onRemove, onRename, onNavigate, onAddFiles,
  onMove, handleContextMenuClick, filesIsFetching, onSetPinning, onDismissFailedPin, selected = [], onSelect
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
      return handleSelect(focusedFile.name, !selected.includes(focusedFile.name))
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
          if (currentIndex === -1) {
            newIndex = files.length - 1 // if no focused file, set to last file
          } else {
            newIndex = currentIndex + 1
          }
          break
        case 'ArrowLeft':
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
          const checkbox: HTMLInputElement | null = element.querySelector('input[type="checkbox"]')
          if (checkbox != null) checkbox.focus()
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
    }} className={gridClassName} tabIndex={0} role="grid" aria-label={t('filesGridLabel')} onFocus={() => setFocused(files[0]?.name)}>
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
          onNavigate={() => onNavigate({ path: file.path, cid: file.cid })}
          onAddFiles={onAddFiles}
          onMove={onMove}
          onSetPinning={onSetPinning}
          onDismissFailedPin={onDismissFailedPin}
          handleContextMenuClick={handleContextMenuClick}
          onSelect={handleSelect}
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

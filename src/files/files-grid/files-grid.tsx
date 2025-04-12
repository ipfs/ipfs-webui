import { useRef, useCallback, type FC, type MouseEvent } from 'react'
import { Trans, withTranslation } from 'react-i18next'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { ExtendedFile, FileStream, normalizeFiles } from '../../lib/files.js'
import GridFile from './grid-file'
// @ts-expect-error - redux-bundler-react is not typed
import { connect } from 'redux-bundler-react'
import './files-grid.css'
import { TFunction } from 'i18next'
import type { ContextMenuFile } from 'src/files/types.js'
import type { CID } from 'multiformats/cid'
import { useShortcuts } from '../../contexts/ShortcutsContext'

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
  // const [focused, setFocused] = useState<string | null>(null)
  const focused = useRef<string | null>(null)
  const filesRefs = useRef<Record<string, HTMLDivElement>>({})
  const gridRef = useRef<HTMLDivElement | null>(null)

  const addFiles = async (filesPromise: Promise<ExtendedFile[]>, onAddFiles: (files: FileStream[]) => void) => {
    const files = await filesPromise
    onAddFiles(normalizeFiles(files))
  }

  const handleSelect = useCallback((fileName: string, isSelected: boolean) => {
    onSelect(fileName, isSelected)
  }, [onSelect])

  const keyHandler = (e: KeyboardEvent) => {
    if (filesIsFetching) return

    const focusedFile = focused.current == null ? null : files.find(el => el.name === focused.current)

    if (e.key === 'Escape') {
      onSelect([], false)
      focused.current = null
      return
    }

    if (e.key === 'F2' && focusedFile != null) {
      return onRename([focusedFile])
    }

    if ((e.key === 'Delete' || e.key === 'Backspace') && selected.length > 0) {
      const selectedFiles = files.filter(f => selected.includes(f.name))
      return onRemove(selectedFiles)
    }

    if ((e.key === ' ') && focusedFile != null) {
      handleSelect(focusedFile.name, !selected.includes(focusedFile.name))
      return
    }

    if (focusedFile != null && ((e.key === 'Enter') || (e.key === 'ArrowRight' && e.metaKey) || (e.key === 'NumpadEnter'))) {
      return onNavigate({ path: focusedFile.path, cid: focusedFile.cid })
    }

    const isArrowKey = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)

    if (isArrowKey) {
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
        focused.current = name
        const element = filesRefs.current[name]
        if (element && element.scrollIntoView) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          const checkbox: HTMLInputElement | null = element.querySelector('input[type="checkbox"]')
          if (checkbox != null) checkbox.focus()
        }
      }
    }
  }

  useShortcuts([{
    keys: ['ArrowUp'],
    label: t('shortcutModal.moveUp'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowUp' } as KeyboardEvent)
    }
  }, {
    keys: ['ArrowDown'],
    label: t('shortcutModal.moveDown'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowDown' } as KeyboardEvent)
    }
  }, {
    keys: ['ArrowLeft'],
    label: t('shortcutModal.moveLeft'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowLeft' } as KeyboardEvent)
    }
  }, {
    keys: ['ArrowRight'],
    label: t('shortcutModal.moveRight'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowRight' } as KeyboardEvent)
    }
  }, {
    keys: ['F2'],
    label: t('shortcutModal.rename'),
    group: t('shortcutModal.actions'),
    action: () => {
      keyHandler({ key: 'F2' } as KeyboardEvent)
    }
  }, {
    keys: ['Delete'],
    label: t('shortcutModal.delete'),
    group: t('shortcutModal.actions'),
    action: () => {
      keyHandler({ key: 'Delete' } as KeyboardEvent)
    }
  },
  {
    keys: ['Backspace'],
    hidden: true,
    label: t('shortcutModal.delete'),
    group: t('shortcutModal.actions'),
    action: () => {
      keyHandler({ key: 'Backspace' } as KeyboardEvent)
    }
  },
  {
    keys: ['Space'],
    label: t('shortcutModal.toggleSelection'),
    group: t('shortcutModal.selection'),
    action: () => {
      keyHandler({ key: ' ' } as KeyboardEvent)
    }
  }, {
    keys: ['Escape'],
    label: t('shortcutModal.deselectAll'),
    group: t('shortcutModal.selection'),
    action: () => {
      keyHandler({ key: 'Escape' } as KeyboardEvent)
    }
  }, {
    keys: ['Enter'],
    label: t('shortcutModal.navigate'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'Enter' } as KeyboardEvent)
    }
  },
  {
    keys: ['NumpadEnter'],
    hidden: true,
    label: t('shortcutModal.navigate'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'NumpadEnter' } as KeyboardEvent)
    }
  },
  {
    keys: ['ArrowRight', 'Meta'],
    hidden: true,
    label: t('shortcutModal.navigate'),
    group: t('shortcutModal.navigation'),
    action: () => {
      keyHandler({ key: 'ArrowRight', metaKey: true } as KeyboardEvent)
    }
  }
  ])

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
          focused={focused.current === file.name}
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

import React, { useRef, useState, useEffect, type FC } from 'react'
import { withTranslation } from 'react-i18next'
import { useDrag, useDrop, type DropTargetMonitor } from 'react-dnd'
import { humanSize, normalizeFiles } from '../../lib/files.js'
import { CID } from 'multiformats/cid'
import { isBinary } from 'istextorbinary'
import FileIcon from '../file-icon/FileIcon.js'
import { connect } from 'redux-bundler-react'
import FileThumbnail from '../file-preview/file-thumbnail.js'
import PinIcon from '../pin-icon/PinIcon.js'
import GlyphDots from '../../icons/GlyphDots.js'
import Checkbox from '../../components/checkbox/checkbox.js'
import { NativeTypes } from 'react-dnd-html5-backend'
import { join, basename } from 'path'
import './grid-file.css'
import { TFunction } from 'i18next'
import type { ContextMenuFile, FileStream } from '../types'

type SetPinningProps = { cid: CID, pinned: boolean }

export interface GridFileProps {
  name: string
  type: string
  size: number
  cid: CID
  path: string
  pinned: boolean
  selected: boolean
  focused: boolean
  isRemotePin: boolean
  isPendingPin: boolean
  isFailedPin: boolean
  refSetter?: (ref: HTMLDivElement | null) => void
  isMfs: boolean
  onNavigate: ({ path, cid }: { path: string, cid: CID }) => void
  onSetPinning: (props: SetPinningProps[]) => void
  onDismissFailedPin: (cid?: CID) => void
  handleContextMenuClick: (ev: React.MouseEvent, clickType: string, file: ContextMenuFile, pos?: { x: number, y: number }) => void
  onSelect: (name: string, isSelected: boolean) => void
  onMove: (src: string, dst: string) => void
  onAddFiles: (files: FileStream[], path: string) => void
}

interface GridFilePropsConnected extends GridFileProps {
  doRead: (cid: CID, offset: number, length: number) => Promise<AsyncIterable<Uint8Array>>
  t: TFunction
}

const GridFile: FC<GridFilePropsConnected> = ({
  name, type, size, cid, path, pinned, t, selected, focused,
  isRemotePin, isPendingPin, isFailedPin, isMfs, refSetter,
  onNavigate, onSetPinning, doRead, onDismissFailedPin, handleContextMenuClick, onSelect, onMove, onAddFiles
}) => {
  const MAX_TEXT_LENGTH = 400 // This is the maximum characters to show in text preview
  const dotsWrapper = useRef<HTMLButtonElement | null>(null)
  const fileRef = useRef<HTMLDivElement | null>(null)

  const [, drag, preview] = useDrag({
    item: { name, size, cid, path, pinned, type: 'FILE' },
    canDrag: isMfs,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const checkIfDir = (monitor: DropTargetMonitor) => {
    if (!isMfs) return false
    if (type !== 'directory') return false

    const item = monitor.getItem()
    if (!item) return false

    if (item.name) {
      return name !== item.name && !selected
    }

    return true
  }

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [NativeTypes.FILE, 'FILE'],
    drop: (_, monitor) => {
      const item = monitor.getItem()

      if (item.files) {
        (async () => {
          const files = await item.filesPromise
          onAddFiles(normalizeFiles(files), path)
        })()
      } else {
        const src = item.path
        const dst = join(path, basename(item.path))

        onMove(src, dst)
      }
    },
    canDrop: (_, monitor) => checkIfDir(monitor),
    collect: (monitor) => ({
      canDrop: checkIfDir(monitor),
      isOver: monitor.isOver()
    })
  })

  const [hasPreview, setHasPreview] = useState(false)
  const [textPreview, setTextPreview] = useState<string | null>(null)

  useEffect(() => {
    setHasPreview(false)
    setTextPreview(null)

    const fetchTextPreview = async () => {
      const isTextFile = type.startsWith('text/') ||
                        type === 'txt' ||
                        /\.(txt|md|js|jsx|ts|tsx|json|css|html|xml|yaml|yml|ini|conf|sh|py|rb|java|c|cpp|h|hpp)$/i.test(name)

      if (isTextFile && cid) {
        try {
          const chunks: Uint8Array[] = []
          let size = 0
          const content: AsyncIterable<Uint8Array> = await doRead(cid, 0, MAX_TEXT_LENGTH)
          if (!content) return

          for await (const chunk of content) {
            chunks.push(chunk)
            size += chunk.length
            if (size >= MAX_TEXT_LENGTH) break
          }
          // TODO: Buffer does not exist in browsers, we need to use Uint8Array instead
          const fullBuffer = Buffer.concat(chunks)

          const decoder = new TextDecoder()
          const text = decoder.decode(fullBuffer)
          if (!isBinary(name, fullBuffer)) {
            setTextPreview(text)
          }
        } catch (err) {
          console.error('Failed to load text preview:', err)
        }
      }
    }

    if (doRead != null) {
      fetchTextPreview()
    }
  }, [doRead, type, cid, name])

  const handleContextMenu = (ev: React.MouseEvent<HTMLDivElement>) => {
    ev.preventDefault()
    handleContextMenuClick(ev, 'RIGHT', { name, size, type, cid, path, pinned })
  }

  const handleDotsClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation()
    const pos = dotsWrapper.current?.getBoundingClientRect()
    handleContextMenuClick(ev, 'TOP', { name, size, type, cid, path, pinned }, pos)
  }

  const handleCheckboxClick = () => {
    onSelect(name, !selected)
  }

  const formattedSize = humanSize(size, { round: 0 })
  const hash = cid.toString() || t('hashUnavailable')

  const setRefs = (el: HTMLDivElement) => {
    fileRef.current = el

    drag(el)

    if (type === 'directory') {
      drop(el)
    }

    preview(el)
  }

  const fileClassName = `grid-file ${selected ? 'selected' : ''} ${focused ? 'focused' : ''} ${isOver && canDrop ? 'drop-target' : ''}`

  return (
    <div
      className={fileClassName}
      onContextMenu={handleContextMenu}
      role="button"
      ref={refSetter}
      data-type={type}
      data-testid="grid-file"
      tabIndex={0}
      title={`${name}`}
      aria-label={t('fileLabel', { name, type, size: formattedSize })}
    >
      <div className="grid-file-checkbox">
        <Checkbox
          disabled={false}
          checked={selected}
          onChange={handleCheckboxClick}
          aria-label={t('checkboxLabel', { name })}
        />
      </div>
      <div
        ref={setRefs}
        className="grid-file-content"
        onClick={() => onNavigate({ path, cid })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onNavigate({ path, cid })
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={t('fileLabel', { name, type, size: formattedSize })}
      >
        <div className="grid-file-preview">
          {isOver && canDrop && (
            <div className="drop-indicator">
              <span>{t('dropHere', { defaultValue: 'Drop here' })}</span>
            </div>
          )}
          <FileThumbnail
            name={name}
            cid={cid}
            textPreview={textPreview}
            onLoad={() => setHasPreview(true)}
          />
          {!hasPreview && (
            <div className="grid-file-icon-fallback">
              <FileIcon style={{ width: 80 }} name={name} type={type} />
            </div>
          )}
          <button
            ref={dotsWrapper}
            className="grid-file-dots"
            onClick={handleDotsClick}
            aria-label={t('checkboxLabel', { name })}
            type="button"
          >
            <GlyphDots />
          </button>
        </div>
        <div className="grid-file-info">
          <div className="grid-file-name" title={name}>{name}</div>
          <div className="grid-file-details">
            <span className="grid-file-size">{formattedSize}</span>
            <button
              className="grid-file-pin"
              onClick={(e) => {
                e.stopPropagation()
                isFailedPin ? onDismissFailedPin() : onSetPinning([{ cid, pinned }])
              }}
              type="button"
              aria-label={t(isFailedPin ? 'dismissFailedPin' : pinned ? 'unpin' : 'pin')}
            >
              <PinIcon
                isFailedPin={isFailedPin}
                isPendingPin={isPendingPin}
                isRemotePin={isRemotePin}
                pinned={pinned}
              />
            </button>
          </div>
          <div className="grid-file-hash" title={hash}>{hash.slice(0, 10)}...{hash.slice(-10)}</div>
        </div>
      </div>
    </div>
  )
}

export default connect(
  'doRead',
  withTranslation('files')(GridFile)
) as FC<GridFileProps>

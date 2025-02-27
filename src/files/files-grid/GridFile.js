import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { useDrag } from 'react-dnd'
import { humanSize } from '../../lib/files.js'
import { CID } from 'multiformats/cid'
import { isBinary } from 'istextorbinary'
import FileIcon from '../file-icon/FileIcon.js'
import { connect } from 'redux-bundler-react'
import FileThumbnail from '../file-preview/FileThumbnail.js'
import PinIcon from '../pin-icon/PinIcon.js'
import GlyphDots from '../../icons/GlyphDots.js'
import Checkbox from '../../components/checkbox/Checkbox.js'
import './GridFile.css'

const GridFile = ({
  name, type, size, cid, path, pinned, t, selected, focused,
  isRemotePin, isPendingPin, isFailedPin, isMfs,
  onNavigate, onSetPinning, doRead, onDismissFailedPin, handleContextMenuClick, onSelect
}) => {
  const MAX_TEXT_LENGTH = 400 // This is the maximum characters to show in text preview
  const dotsWrapper = useRef()
  const [, drag] = useDrag({
    item: { name, size, cid, path, pinned, type: 'FILE' },
    canDrag: isMfs
  })
  const [hasPreview, setHasPreview] = useState(false)
  const [textPreview, setTextPreview] = useState(null)

  useEffect(() => {
    const fetchTextPreview = async () => {
      const isTextFile = type.startsWith('text/') ||
                        type === 'txt' ||
                        /\.(txt|md|js|jsx|ts|tsx|json|css|html|xml|yaml|yml|ini|conf|sh|py|rb|java|c|cpp|h|hpp)$/i.test(name)

      if (isTextFile && cid) {
        try {
          const chunks = []
          let size = 0
          const content = await doRead(cid, 0, MAX_TEXT_LENGTH)
          if (!content) return

          for await (const chunk of content) {
            chunks.push(chunk)
            size += chunk.length
            if (size >= MAX_TEXT_LENGTH) break
          }

          const decoder = new TextDecoder()
          const text = decoder.decode(Buffer.concat(chunks))
          if (!isBinary(name, text)) {
            setTextPreview(text)
          }
        } catch (err) {
          console.error('Failed to load text preview:', err)
        }
      }
    }

    if (doRead) {
      fetchTextPreview()
    }
  }, [doRead, type, cid, name])

  const handleContextMenu = (ev) => {
    ev.preventDefault()
    handleContextMenuClick(ev, 'RIGHT', { name, size, type, cid, path, pinned })
  }

  const handleDotsClick = (ev) => {
    ev.stopPropagation()
    const pos = dotsWrapper.current.getBoundingClientRect()
    handleContextMenuClick(ev, 'TOP', { name, size, type, cid, path, pinned }, pos)
  }

  const handleCheckboxClick = (ev) => {
    // ev.stopPropagation()
    onSelect(name, !selected)
  }

  const formattedSize = humanSize(size, { round: 0 })
  const hash = cid.toString() || t('hashUnavailable')

  return (
    <div
      className={`grid-file ${selected ? 'selected' : ''} ${focused ? 'focused' : ''}`}
      onContextMenu={handleContextMenu}
      role="button"
      tabIndex={0}
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
        ref={drag}
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
          <FileThumbnail
            name={name}
            cid={cid}
            textPreview={textPreview}
            onLoad={() => setHasPreview(true)}
          />
          {!hasPreview && <FileIcon name={name} type={type} />}
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
          <div className="grid-file-hash" title={hash}>{hash}</div>
        </div>
      </div>
    </div>
  )
}

GridFile.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number,
  cid: PropTypes.instanceOf(CID),
  path: PropTypes.string.isRequired,
  pinned: PropTypes.bool,
  selected: PropTypes.bool,
  isRemotePin: PropTypes.bool,
  isPendingPin: PropTypes.bool,
  isFailedPin: PropTypes.bool,
  isMfs: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
  onSetPinning: PropTypes.func.isRequired,
  onDismissFailedPin: PropTypes.func.isRequired,
  handleContextMenuClick: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  focused: PropTypes.bool
}

export default connect(
  'doRead',
  withTranslation('files')(GridFile)
)

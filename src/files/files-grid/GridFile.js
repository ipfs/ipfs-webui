import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { useDrag } from 'react-dnd'
import { humanSize } from '../../lib/files.js'
import { CID } from 'multiformats/cid'
import FileIcon from '../file-icon/FileIcon.js'
import FileThumbnail from '../file-preview/FileThumbnail.js'
import PinIcon from '../pin-icon/PinIcon.js'
import GlyphDots from '../../icons/GlyphDots.js'
import './GridFile.css'

const GridFile = ({
  name, type, size, cid, path, pinned, t,
  isRemotePin, isPendingPin, isFailedPin, isMfs,
  onNavigate, onSetPinning, onDismissFailedPin, handleContextMenuClick
}) => {
  const dotsWrapper = useRef()
  const [, drag] = useDrag({
    item: { name, size, cid, path, pinned, type: 'FILE' },
    canDrag: isMfs
  })
  const [hasPreview, setHasPreview] = useState(false)

  const handleContextMenu = (ev) => {
    handleContextMenuClick(ev, 'RIGHT', { name, size, type, cid, path, pinned })
  }

  const handleDotsClick = (ev) => {
    ev.stopPropagation()
    const pos = dotsWrapper.current.getBoundingClientRect()
    handleContextMenuClick(ev, 'TOP', { name, size, type, cid, path, pinned }, pos)
  }

  const formattedSize = humanSize(size, { round: 0 })
  const hash = cid.toString() || t('hashUnavailable')

  return (
    <button
      ref={drag}
      className="grid-file"
      onContextMenu={handleContextMenu}
      onClick={() => onNavigate({ path, cid })}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNavigate({ path, cid })
        }
      }}
      type="button"
      aria-label={t('fileLabel', { name, type, size: formattedSize })}
    >
      <div className="grid-file-preview">
        <FileThumbnail
          name={name}
          cid={cid}
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
    </button>
  )
}

GridFile.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  size: PropTypes.number,
  cid: PropTypes.instanceOf(CID),
  path: PropTypes.string.isRequired,
  pinned: PropTypes.bool,
  isRemotePin: PropTypes.bool,
  isPendingPin: PropTypes.bool,
  isFailedPin: PropTypes.bool,
  isMfs: PropTypes.bool,
  onNavigate: PropTypes.func.isRequired,
  onSetPinning: PropTypes.func.isRequired,
  onDismissFailedPin: PropTypes.func.isRequired,
  handleContextMenuClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

export default withTranslation('files')(GridFile)

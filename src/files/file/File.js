import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { join, basename } from 'path'
import { withTranslation } from 'react-i18next'
import classnames from 'classnames'
import { normalizeFiles, humanSize } from '../../lib/files.js'
// React DnD
import { useDrag, useDrop } from 'react-dnd'
// Components
import GlyphDots from '../../icons/GlyphDots.js'
import Tooltip from '../../components/tooltip/Tooltip.js'
import Checkbox from '../../components/checkbox/Checkbox.js'
import FileIcon from '../file-icon/FileIcon.js'
import { CID } from 'multiformats/cid'
import { NativeTypes } from 'react-dnd-html5-backend'
import PinIcon from '../pin-icon/PinIcon.js'

const File = ({
  name, type, size, cid, path, pinned, t, selected, focused, translucent, coloured, cantSelect, cantDrag, isMfs, isRemotePin, isPendingPin, isFailedPin,
  onAddFiles, onMove, onSelect, onNavigate, onSetPinning, onDismissFailedPin, handleContextMenuClick
}) => {
  const dotsWrapper = useRef()

  const handleCtxLeftClick = (ev) => {
    const pos = dotsWrapper.current.getBoundingClientRect()
    handleContextMenuClick(ev, 'LEFT', { name, size, type, cid, path, pinned }, pos)
  }

  const handleCtxRightClick = (ev) => {
    handleContextMenuClick(ev, 'RIGHT', { name, size, type, cid, path, pinned })
  }

  const [, drag, preview] = useDrag({
    item: { name, size, cid, path, pinned, type: 'FILE' },
    canDrag: !cantDrag && isMfs
  })

  const checkIfDir = (monitor) => {
    if (!isMfs) return false
    const item = monitor.getItem()
    if (!item) return false

    if (item.name) {
      return type === 'directory' &&
        name !== item.name &&
        !selected
    }

    return type === 'directory'
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

  let className = 'File b--light-gray relative flex items-center bt'

  if (selected) {
    className += ' selected'
  }

  const styles = { height: 55, overflow: 'visible' }

  if (focused || (selected && !translucent) || coloured || (isOver && canDrop)) {
    styles.backgroundColor = '#F0F6FA'
  } else if (translucent) {
    className += ' o-70'
  }

  if (focused) {
    styles.border = '1px dashed #9ad4db'
  } else {
    styles.border = '1px solid transparent'
    styles.borderTop = '1px solid #eee'
  }

  size = humanSize(size, { round: 0 })
  const hash = cid.toString() || t('hashUnavailable')

  const select = (select) => onSelect(name, select)

  const checkBoxCls = classnames({
    'o-70 glow': !cantSelect,
    'o-1': selected || focused
  }, ['pl2 w2'])

  return (
    <div ref={drop}>
      <div className={className} style={styles} onContextMenu={handleCtxRightClick} ref={drag}>
        <div className={checkBoxCls}>
          <Checkbox disabled={cantSelect} checked={selected} onChange={select} aria-label={ t('checkboxLabel', { name })} />
        </div>

        <button ref={preview} onClick={onNavigate} className='relative pointer flex items-center flex-grow-1 ph2 pv1 w-40' aria-label={ name === '..' ? t('previousFolder') : t('fileLabel', { name, type, size }) }>
          <div className='dib flex-shrink-0 mr2'>
            <FileIcon name={name} type={type} />
          </div>
          <div style={{ width: 'calc(100% - 3.25rem)' }}>
            <Tooltip text={name}>
              <div className='f6 truncate charcoal'>{name}</div>
            </Tooltip>
            <Tooltip text={hash}>
              <div className='f7 mt1 gray truncate monospace'>{hash}</div>
            </Tooltip>
          </div>
        </button>

        <div className='ph2 pv1 flex-none hide-child dn db-l tr mw3 w-20 transition-all'>
          <button className='ph2 db button-inside-focus' style={{ width: '2.5rem', height: '2rem' }} onClick={isFailedPin ? onDismissFailedPin : () => onSetPinning([{ cid, pinned }])}>
            <PinIcon isFailedPin={isFailedPin} isPendingPin={isPendingPin} isRemotePin={isRemotePin} pinned={pinned} />
          </button>
        </div>
        <div className='size pl2 pr4 pv1 flex-none f6 dn db-l tr charcoal-muted w-10 mw4'>
          {size}
        </div>
        <button ref={dotsWrapper} className='ph2 db button-inside-focus file-context-menu' style={{ width: '2.5rem' }} onClick={handleCtxLeftClick} aria-label={ t('checkboxLabel', { name })} >
          <GlyphDots className='fill-gray-muted pointer hover-fill-gray transition-all'/>
        </button>
      </div>
    </div>
  )
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  size: PropTypes.number,
  cid: PropTypes.instanceOf(CID),
  selected: PropTypes.bool,
  focused: PropTypes.bool,
  onSelect: PropTypes.func,
  onNavigate: PropTypes.func.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDismissFailedPin: PropTypes.func.isRequired,
  coloured: PropTypes.bool,
  translucent: PropTypes.bool,
  handleContextMenuClick: PropTypes.func,
  pinned: PropTypes.bool,
  isMfs: PropTypes.bool
}

File.defaultProps = {
  coloured: false,
  translucent: false
}

export default withTranslation('files')(File)

import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { join, basename } from 'path'
import { withTranslation } from 'react-i18next'
import classnames from 'classnames'
import { normalizeFiles, humanSize } from '../../lib/files'
// React DnD
import { useDrag, useDrop } from 'react-dnd'
// Components
// import GlyphPinCloud from '../../icons/GlyphPinCloud'
import Tooltip from '../../components/tooltip/Tooltip'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import CID from 'cids'
import { NativeTypes } from 'react-dnd-html5-backend'

import RetroButton from '../../components/common/atoms/RetroButton'
// import OptionsIcon from '../../icons/retro/OptionsIcon'
// import PinnedIcon from '../../icons/retro/PinIcon'
import More3dotsIcon from '../../icons/retro/More3dotsIcon'
import FileListPicIcon from '../../icons/retro/files/FileListPinIcon'
import FileListPinGreenIcon from '../../icons/retro/files/FileListPinGreenFullIcon'

const File = ({
  name, type, size, cid, path, pinned, t, selected, focused, translucent, coloured, cantSelect, cantDrag, isMfs, isRemotePin,
  onAddFiles, onMove, onSelect, onNavigate, handleContextMenuClick
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

  if (!(focused || (selected && !translucent) || coloured || (isOver && canDrop)) && translucent) {
    className += ' o-70'
  }

  if (focused) {
    styles.border = '1px dashed #9ad4db'
  } else {
    styles.border = '1px solid transparent'
  }

  size = size ? humanSize(size, { round: 0 }) : '-'
  const hash = cid.toString() || t('hashUnavailable')

  const select = (select) => onSelect(name, select)

  const checkBoxCls = classnames({
    'o-1': selected || focused
  }, ['pl2 w2'])

  return (
    <div ref={drop}>
      <div className={className} style={styles} onContextMenu={handleCtxRightClick} ref={drag}>
        <div className={checkBoxCls} style={{ marginLeft: '4px' }}>
          <Checkbox disabled={cantSelect} checked={selected} onChange={select} aria-label={t('checkboxLabel', { name })} />
        </div>

        <button ref={preview} onClick={onNavigate} className='relative pointer flex items-center flex-grow-1 pa0 pv1 w-40' aria-label={name === '..' ? t('previousFolder') : t('fileLabel', { name, type, size })}>
          <div className='dib flex-shrink-0 mr2'>
            <FileIcon name={name} type={type} />
          </div>
          <div style={{ width: 'calc(100% - 3.25rem)' }}>
            <Tooltip text={name}>
              <div className='f5 truncate w95fa white lh-solid spacegrotesk'>{name}</div>
            </Tooltip>
            <Tooltip text={hash}>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)' }} className='f7 mt1 truncate w95fa spacegrotesk'>{hash}</div>
            </Tooltip>
          </div>
        </button>

        <div className='ph2 pv1 db tr mw3 w-20 transition-all flex justify-center'>
          {
            !pinned && <FileListPicIcon color='#312F62' />
          }
          {pinned && !isRemotePin && <div className='br-100 o-70' title={t('pinned')} style={{ width: '2rem', height: '2rem' }}>
            <FileListPinGreenIcon />
          </div>}
          {(isRemotePin) && <div className='br-100 o-70' title={t('pinnedRemotely')} style={{ width: '2rem', height: '2rem' }}>
            {/* <GlyphPinCloud className='fill-aqua' /> */}
            <FileListPinGreenIcon />
          </div>}
        </div>
        <div className='size pl2 pr4 pv1 f6 db tr w95fa white w-10 mw4 flex justify-center spacegrotesk' style={{ textTransform: 'lowercase' }}>
          {size}
        </div>
        <div ref={dotsWrapper} className='ph2 db button-inside-focus' aria-label={t('checkboxLabel', { name })} >
          <RetroButton width='28px' height='28px' border='none' onClick={handleCtxLeftClick} className='ph2 db button-inside-focus' aria-label={t('checkboxLabel', { name })} >
            <More3dotsIcon />
          </RetroButton>
        </div>

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

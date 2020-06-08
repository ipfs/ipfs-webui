import React from 'react'
import PropTypes from 'prop-types'
import { join, basename } from 'path'
import filesize from 'filesize'
import { withTranslation } from 'react-i18next'
import classNames from 'classnames'
import { filesToStreams } from '../../lib/files'
// React DnD
import { DropTarget, DragSource } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
// Components
import GlyphDots from '../../icons/GlyphDots'
import GlyphPin from '../../icons/GlyphPin'
import Tooltip from '../../components/tooltip/Tooltip'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'

class File extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    size: PropTypes.number,
    hash: PropTypes.string,
    selected: PropTypes.bool,
    onFocus: PropTypes.func,
    onSelect: PropTypes.func,
    onNavigate: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    coloured: PropTypes.bool,
    translucent: PropTypes.bool,
    handleContextMenuClick: PropTypes.func,
    pinned: PropTypes.bool,
    isMfs: PropTypes.bool,
    // Injected by DragSource and DropTarget
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    isDragging: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired
  }

  static defaultProps = {
    coloured: false,
    translucent: false
  }

  handleCtxLeftClick = (ev) => {
    const { name, type, size, hash, path, pinned } = this.props
    const pos = this.dotsWrapper.getBoundingClientRect()
    this.props.handleContextMenuClick(ev, 'LEFT', { name, size, type, hash, path, pinned }, pos)
  }

  handleCtxRightClick = (ev) => {
    const { name, type, size, hash, path, pinned } = this.props
    this.props.handleContextMenuClick(ev, 'RIGHT', { name, size, type, hash, path, pinned })
  }

  render () {
    let {
      t, selected, translucent, coloured, hash, name, type, size, pinned, onSelect, onNavigate,
      isOver, canDrop, cantDrag, cantSelect, connectDropTarget, connectDragPreview, connectDragSource,
      styles = {}
    } = this.props

    const shouldColor = ((selected && !translucent) || coloured || (isOver && canDrop))

    styles = {
      ...styles,
      ...(shouldColor && { backgroundColor: '#F0F6FA' }),
      border: '1px solid transparent',
      borderTop: '1px solid #eee',
      height: 55,
      overflow: 'hidden'
    }

    size = size ? filesize(size, { round: 0 }) : '-'
    hash = hash || t('hashUnavailable')

    const element = connectDropTarget(
      <div className={classNames('File b--light-gray relative flex items-center bt', selected && 'selected', translucent && 'o-70')} style={styles} onContextMenu={this.handleCtxRightClick}>
        <div className={classNames('pl2 w2', !cantSelect && 'o-70 glow', selected && 'o-1')}>
          <Checkbox disabled={cantSelect} onFocus={() => this.props.onFocus({ name })} checked={selected} onChange={(select) => onSelect(name, select)} aria-label={ t('checkboxLabel', { name })} />
        </div>
        {connectDragPreview(
          <button onClick={onNavigate} className='relative pointer flex items-center flex-grow-1 ph2 pv1 w-40' aria-label={ name === '..' ? t('previousFolder') : t('fileLabel', { name, type, size }) }>
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
        )}
        <div className='ph2 pv1 flex-none dn db-l tr mw3'>
          { pinned && <div className='bg-snow br-100 o-70' title={t('pinned')} style={{ width: '1.5rem', height: '1.5rem' }}>
            <GlyphPin className='fill-teal-muted' />
          </div> }
        </div>
        <div className='size pl2 pr4 pv1 flex-none f6 dn db-l tr charcoal-muted w-10 mw4'>
          {size}
        </div>
        <button ref={el => { this.dotsWrapper = el }} className='ph2 db button-inside-focus' style={{ width: '2.5rem' }} onClick={this.handleCtxLeftClick} aria-label={ t('checkboxLabel', { name })} >
          <GlyphDots className='fill-gray-muted pointer hover-fill-gray transition-all'/>
        </button>
      </div>
    )

    if (cantDrag) {
      return element
    }

    return connectDragSource(element)
  }
}

File.TYPE = Symbol('file')

const dragSource = {
  isDragging: (props, monitor) => monitor.getItem().name === props.name,
  beginDrag: ({ name, type, path, setIsDragging }) => {
    setIsDragging()
    return { name, type, path }
  },
  canDrag: props => props.isMfs,
  endDrag: (props) => { props.setIsDragging(false) }
}

const dragCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging()
})

const dropTarget = {
  drop: (props, monitor) => {
    const item = monitor.getItem()

    // eslint-disable-next-line no-prototype-builtins
    if (item.hasOwnProperty('files')) {
      (async () => {
        const files = await item.filesPromise
        props.onAddFiles(await filesToStreams(files), props.path)
      })()
    } else {
      const src = item.path
      const dst = join(props.path, basename(item.path))

      props.onMove(src, dst)
    }
  },
  canDrop: (props, monitor) => {
    if (!props.isMfs) return false
    const item = monitor.getItem()

    // eslint-disable-next-line no-prototype-builtins
    if (item.hasOwnProperty('name')) {
      return props.type === 'directory' &&
        props.name !== item.name &&
        !props.selected
    }

    return props.type === 'directory'
  }
}

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})

export default DragSource(File.TYPE, dragSource, dragCollect)(
  DropTarget([File.TYPE, NativeTypes.FILE], dropTarget, dropCollect)(
    withTranslation('files')(File)
  )
)

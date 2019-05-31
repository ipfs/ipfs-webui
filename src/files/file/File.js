import React from 'react'
import PropTypes from 'prop-types'
import { join, basename } from 'path'
import filesize from 'filesize'
import classnames from 'classnames'
import { filesToStreams } from '../../lib/files'
// React DnD
import { DropTarget, DragSource } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
// Components
import GlyphDots from '../../icons/GlyphDots'
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
    focused: PropTypes.bool,
    onSelect: PropTypes.func,
    onNavigate: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    coloured: PropTypes.bool,
    translucent: PropTypes.bool,
    handleContextMenuClick: PropTypes.func,
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
    const { name, type, size, hash, path } = this.props
    const dotsPosition = this.dotsWrapper.getBoundingClientRect()
    this.props.handleContextMenuClick(ev, 'LEFT', { name, size, type, hash, path }, dotsPosition)
  }

  handleCtxRightClick = (ev) => {
    const { name, type, size, hash, path } = this.props
    this.props.handleContextMenuClick(ev, 'RIGHT', { name, size, type, hash, path })
  }

  render () {
    let {
      selected, focused, translucent, coloured, hash, name, type, size, onSelect, onNavigate,
      isOver, canDrop, cantDrag, cantSelect, connectDropTarget, connectDragPreview, connectDragSource,
      styles = {}
    } = this.props

    let className = 'File b--light-gray relative flex items-center bt'

    if (selected) {
      className += ' selected'
    }

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

    styles.height = 55
    styles.overflow = 'hidden'

    size = size ? filesize(size, { round: 0 }) : '-'
    hash = hash || 'Hash cannot be calculated' // TODO: what to put here

    const select = (select) => onSelect(name, select)

    const checkBoxCls = classnames({
      'o-70 glow': !cantSelect,
      'o-1': selected || focused
    }, ['pl2 w2'])

    const element = connectDropTarget(
      <div className={className} style={styles} onContextMenu={this.handleCtxRightClick}>
        <div className={checkBoxCls}>
          <Checkbox disabled={cantSelect} checked={selected} onChange={select} />
        </div>
        {connectDragPreview(
          <div onClick={onNavigate} className='relative pointer flex items-center flex-grow-1 ph2 pv1 w-40'>
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
          </div>
        )}
        <div className='size pl2 pr4 pv1 flex-none f6 dn db-l tr charcoal-muted'>
          {size}
        </div>
        <div ref={el => { this.dotsWrapper = el }} className='ph2' style={{ width: '2.5rem' }}>
          <GlyphDots className='fill-gray-muted pointer hover-fill-gray transition-all' onClick={this.handleCtxLeftClick} />
        </div>
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

    if (item.hasOwnProperty('files')) {
      (async () => {
        const files = await item.filesPromise
        props.onAddFiles(await filesToStreams(files), props.path)
      })()
    } else {
      const src = item.path
      const dst = join(props.path, basename(item.path))

      props.onMove([src, dst])
    }
  },
  canDrop: (props, monitor) => {
    const item = monitor.getItem()

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
    File
  )
)

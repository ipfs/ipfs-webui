import React from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import ContextMenu from '../context-menu/ContextMenu'
import Tooltip from '../../components/tooltip/Tooltip'
import { DropTarget, DragSource } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { join, basename } from 'path'

class File extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    cumulativeSize: PropTypes.number,
    hash: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    focused: PropTypes.bool,
    onSelect: PropTypes.func,
    onNavigate: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    onShare: PropTypes.func,
    onDelete: PropTypes.func,
    onRename: PropTypes.func,
    onInspect: PropTypes.func,
    onDownload: PropTypes.func,
    coloured: PropTypes.bool,
    translucent: PropTypes.bool,
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

  state = {
    isContextMenuOpen: false,
    translateX: 0,
    translateY: 0
  }

  handleCtxRef = (el) => { this.contextMenu = findDOMNode(el) }

  handleCtxLeftClick = (ev) => this.handleContextMenuClick(ev, 'LEFT')

  handleCtxRightClick = (ev) => this.handleContextMenuClick(ev, 'RIGHT')

  handleContextMenuClick = (ev, clickType) => {
    // This is needed to disable the native OS right-click menu
    // and deal with the clicking on the ContextMenu options
    if (ev !== undefined && typeof ev !== 'string') {
      ev.preventDefault()
    }

    if (clickType === 'RIGHT') {
      ev.persist()

      const ctxMenuPosition = this.contextMenu.getBoundingClientRect()

      this.setState(state => ({
        isContextMenuOpen: !state.isContextMenuOpen,
        translateX: (ctxMenuPosition.x + ctxMenuPosition.width / 2) - ev.clientX,
        translateY: (ctxMenuPosition.y + ctxMenuPosition.height / 2) - ev.clientY
      }))
    } else {
      this.setState(state => ({
        isContextMenuOpen: !state.isContextMenuOpen,
        translateX: 0,
        translateY: 0
      }))
    }
  }

  render () {
    let {
      selected, focused, translucent, coloured, hash, name, type, size, cumulativeSize,
      onSelect, onNavigate, onDelete, onInspect, onRename, onShare, onDownload,
      isOver, canDrop, cantDrag, cantSelect, connectDropTarget, connectDragPreview, connectDragSource,
      styles = {}
    } = this.props

    let className = 'File b--light-gray hide-child-l relative flex items-center bt'

    if (selected) {
      className += ' selected'
    }

    if (focused || (selected && !translucent) || coloured || (isOver && canDrop)) {
      styles.backgroundColor = '#F0F6FA'
    } else if (translucent) {
      className += ' o-50'
    }

    if (focused) {
      styles.border = '1px dashed #9ad4db'
    } else {
      styles.border = '1px solid transparent'
      styles.borderTop = '1px solid #eee'
    }

    size = filesize(cumulativeSize || size, { round: 0 })

    const select = (select) => onSelect(name, select)

    const element = connectDropTarget(
      <div className={className} style={styles} onContextMenu={this.handleCtxRightClick}>
        <div className='child float-on-left-l pa2 w2' style={(selected || focused) ? { opacity: '1' } : null}>
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
        <div className='ph2 pv1 relative' style={{ width: '2.5rem' }}>
          <ContextMenu
            ref={this.handleCtxRef}
            handleClick={this.handleCtxLeftClick}
            translateX={this.state.translateX}
            translateY={this.state.translateY}
            isOpen={this.state.isContextMenuOpen}
            mousePosition={this.state.mousePosition}
            onShare={onShare}
            onDelete={onDelete}
            onRename={onRename}
            onInspect={onInspect}
            onDownload={onDownload}
            hash={hash} />
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
      props.onAddFiles(item, props.path)
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

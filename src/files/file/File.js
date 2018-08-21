import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import ContextMenu from '../context-menu/ContextMenu'
import Tooltip from '../../components/tooltip/Tooltip'
import { DropTarget, DragSource } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { join, basename } from 'path'

const File = (props) => {
  let {
    selected,
    focused,
    translucent,
    coloured,
    hash,
    name,
    type,
    size,
    cumulativeSize,
    onSelect,
    onNavigate,
    onDelete,
    onInspect,
    onRename,
    onShare,
    onDownload,
    isOver,
    canDrop,
    styles = {},
    cantDrag,
    cantSelect,
    connectDropTarget,
    connectDragPreview,
    connectDragSource
  } = props

  let className = 'File b--light-gray hide-child-l relative flex items-center bt pv1'

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
    <div className={className} style={styles}>
      <div className='child float-on-left-l pa2 w2' style={(selected || focused) ? {opacity: '1'} : null}>
        <Checkbox disabled={cantSelect} checked={selected} onChange={select} />
      </div>
      {connectDragPreview(
        <div className='relative flex items-center flex-grow-1 ph2 pv1 w-40'>
          <div className='pointer dib flex-shrink-0 mr2' onClick={onNavigate}>
            <FileIcon name={name} type={type} />
          </div>
          <div style={{ width: 'calc(100% - 3.25rem)' }}>
            <Tooltip text={name}>
              <div onClick={onNavigate} className='f6 pointer truncate' style={{ color: '#656464' }}>{name}</div>
            </Tooltip>

            <Tooltip text={hash}>
              <div onClick={onNavigate} className='f7 pointer mt1 gray truncate monospace'>{hash}</div>
            </Tooltip>
          </div>
        </div>
      )}
      <div className='size ph2 pv1 w-10 f6 monospace dn db-l' style={{ color: '#A0B8C5' }}>{size}</div>
      <div className='ph2 pv1 relative' style={{width: '2.5rem'}}>
        <ContextMenu
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

File.propTypes = {
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

File.defaultProps = {
  coloured: false,
  translucent: false
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

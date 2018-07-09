import React from 'react'
import PropTypes from 'prop-types'
import filesize from 'filesize'
import Checkbox from '../../components/checkbox/Checkbox'
import FileIcon from '../file-icon/FileIcon'
import Tooltip from '../../components/tooltip/Tooltip'
import { DropTarget, DragSource } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { join, basename } from 'path'
import './File.css'

function File ({
  selected,
  translucent,
  coloured,
  hash,
  name,
  path,
  type,
  size,
  onSelect,
  onNavigate,
  isOver,
  canDrop,
  connectDropTarget,
  connectDragPreview,
  connectDragSource,
  ...props
}) {
  let className = 'File flex items-center bt pv2'

  if ((selected && !translucent) || coloured || (isOver && canDrop)) {
    className += ' coloured'
  } else if (translucent) {
    className += ' o-50'
  }

  if (type === 'directory') {
    size = ''
  } else {
    size = filesize(size, { round: 0 })
  }

  const select = (select) => onSelect(name, select)
  const navigate = () => onNavigate(path)

  return connectDropTarget(connectDragSource(
    <div className={className} {...props}>
      <div className='pa2 w2'>
        <Checkbox checked={selected} onChange={select} />
      </div>
      {connectDragPreview(
        <div className='name relative flex items-center flex-grow-1 pa2 w-40'>
          <div className='pointer dib icon flex-shrink-0' onClick={navigate}>
            <FileIcon name={name} type={type} />
          </div>
          <div className='f6'>
            <Tooltip text={name}>
              <div onClick={navigate} className='pointer truncate'>{name}</div>
            </Tooltip>

            <Tooltip text={hash}>
              <div onClick={navigate} className='pointer mt1 gray truncate monospace'>{hash}</div>
            </Tooltip>
          </div>
        </div>
      )}
      <div className='size pa2 w-10 monospace dn db-l'>{size}</div>
    </div>
  ))
}

File.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onInspect: PropTypes.func.isRequired,
  onAddFiles: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
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

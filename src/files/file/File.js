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
import './File.css'

const TreeDots = (props) => {
  return (
    <svg viewBox='0 0 100 400' {...props}>
      <path d='M47.172 94.345c-14.151 0-23.586-4.717-33.02-14.152C4.717 70.76 0 58.966 0 47.173 0 33.02 4.717 23.585 14.152 14.151 23.586 4.717 35.379 0 47.172 0 58.966 0 70.76 4.717 80.193 14.152c9.435 9.434 14.152 21.227 14.152 33.02 0 11.794-4.717 23.587-14.152 33.021-9.434 9.435-21.227 14.152-33.02 14.152zm0 141.517c-14.151 0-23.586-4.717-33.02-14.152C4.717 212.276 0 200.483 0 188.69c0-14.152 4.717-23.587 14.152-33.021 9.434-9.435 21.227-14.152 33.02-14.152 11.794 0 23.587 4.717 33.021 14.152 9.435 9.434 14.152 21.228 14.152 33.02 0 11.794-4.717 23.587-14.152 33.021-9.434 9.435-21.227 14.152-33.02 14.152zm0 141.517c-14.151 0-23.586-4.717-33.02-14.151C4.717 353.793 0 342 0 330.207c0-14.152 4.717-23.586 14.152-33.02 9.434-9.435 21.227-14.153 33.02-14.153 11.794 0 23.587 4.718 33.021 14.152 9.435 9.435 14.152 21.228 14.152 33.02 0 11.794-4.717 23.587-14.152 33.022-9.434 9.434-21.227 14.151-33.02 14.151z'/>
    </svg>
  )
}

class File extends React.Component {
  state = {
    isMenuOpen: false
  }

  toggleIsMenuOpen = () => {
    this.setState(s => ({ isMenuOpen: !s.isMenuOpen }))
  }

  render () {
    let {
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
    } = this.props

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
      <div className={className}>
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
        <div className='pa2 relative' width='1.5rem'>
          <TreeDots width='0.35rem' className='fill-gray-muted pointer' onClick={this.toggleIsMenuOpen} />
          <ContextMenu
            left='auto'
            right={0}
            className='absolute'
            onDismiss={this.toggleIsMenuOpen}
            open={this.state.isMenuOpen}
          />
        </div>
      </div>
    ))
  }
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

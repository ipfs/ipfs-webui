import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../components/checkbox/Checkbox'
import SelectedActions from '../selected-actions/SelectedActions'
import File from '../file/File'
import { NativeTypes } from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
import { join, basename } from 'path'
import './FilesList.css'

const ORDER_BY_NAME = 'name'
const ORDER_BY_SIZE = 'size'

function compare (a, b, asc) {
  if (a > b) {
    return asc ? 1 : -1
  } else if (a < b) {
    return asc ? -1 : 1
  } else {
    return 0
  }
}

class FileList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onShare: PropTypes.func.isRequired,
    onInspect: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired,
    downloadProgress: PropTypes.number.isRequired,
    maxWidth: PropTypes.string,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
  }

  static defaultProps = {
    className: '',
    maxWidth: '100%'
  }

  state = {
    selected: [],
    sortBy: ORDER_BY_NAME,
    sortAsc: true,
    isDragging: false
  }

  get selectedFiles () {
    return this.state.selected.map(name =>
      this.props.files.find(el => el.name === name)
    )
  }

  get selectedMenu () {
    if (this.state.selected.length === 0) {
      return null
    }

    const unselectAll = () => this.toggleAll(false)
    const size = this.selectedFiles.reduce((a, b) => a + b.size, 0)

    return (
      <SelectedActions
        className='fixed bottom-0 right-0'
        style={{maxWidth: this.props.maxWidth}}
        unselect={unselectAll}
        remove={this.wrapWithSelected('onDelete')}
        share={this.wrapWithSelected('onShare')}
        rename={this.wrapWithSelected('onRename')}
        download={this.wrapWithSelected('onDownload')}
        inspect={this.wrapWithSelected('onInspect')}
        count={this.state.selected.length}
        downloadProgress={this.props.downloadProgress}
        size={size}
      />
    )
  }

  get files () {
    const { isOver, canDrop } = this.props

    return this.props.files.sort((a, b) => {
      if (a.type === b.type) {
        if (this.state.sortBy === ORDER_BY_NAME) {
          return compare(a.name, b.name, this.state.sortAsc)
        } else {
          return compare(a.size, b.size, this.state.sortAsc)
        }
      }

      if (a.type === 'directory') {
        return -1
      } else {
        return 1
      }
    }).map(file => (
      <File
        onSelect={this.toggleOne}
        onNavigate={this.props.onNavigate}
        onInspect={this.props.onInspect}
        selected={this.state.selected.indexOf(file.name) !== -1}
        onAddFiles={this.props.onAddFiles}
        onMove={this.move}
        key={window.encodeURIComponent(file.name)}
        setIsDragging={this.isDragging}
        translucent={this.state.isDragging || (isOver && canDrop)}
        {...file}
      />
    ))
  }

  wrapWithSelected = (fn) => () => {
    this.props[fn](this.selectedFiles)
  }

  toggleAll = (checked) => {
    let selected = []

    if (checked) {
      selected = this.props.files.map(file => file.name)
    }

    this.setState({ selected: selected })
  }

  toggleOne = (name, check) => {
    let selected = this.state.selected
    let index = selected.indexOf(name)

    if (check && index < 0) {
      selected.push(name)
    } else if (index >= 0) {
      selected.splice(this.state.selected.indexOf(name), 1)
    }

    this.setState({selected: selected})
  }

  move = ([src, dst]) => {
    const selected = this.selectedFiles

    if (selected.length > 0) {
      const parts = dst.split('/')
      parts.pop()
      const basepath = parts.join('/')
      const toMove = selected.map(({ name, path }) => ([
        path,
        join(basepath, name)
      ]))

      const res = toMove.find(a => a[0] === src)
      if (!res) {
        toMove.push([src, dst])
      }

      this.toggleAll(false)
      toMove.forEach(op => this.props.onMove(op))
    } else {
      this.props.onMove([src, dst])
    }
  }

  sortByIcon = (order) => {
    if (this.state.sortBy === order) {
      return (this.state.sortAsc) ? '↑' : '↓'
    }

    return null
  }

  changeSort = (order) => () => {
    if (order === this.state.sortBy) {
      this.setState({ sortAsc: !this.state.sortAsc })
    } else {
      this.setState({ sortBy: order, sortAsc: true })
    }
  }

  isDragging = (is = true) => {
    this.setState({ isDragging: is })
  }

  render () {
    let {className, connectDropTarget} = this.props
    className = `FilesList no-select sans-serif border-box w-100 ${className}`

    if (this.state.selected.length !== 0) {
      className += ' mb6'
    }

    return connectDropTarget(
      <section className={className} style={{ minHeight: '500px' }}>
        <header className='gray pv3 flex items-center'>
          <div className='ph2 w2'>
            <Checkbox checked={this.state.selected.length === this.props.files.length} onChange={this.toggleAll} />
          </div>
          <div className='ph2 f6 flex-grow-1 w-40'>
            <span onClick={this.changeSort(ORDER_BY_NAME)} className='pointer'>
              File name {this.sortByIcon(ORDER_BY_NAME)}
            </span>
          </div>
          <div className='ph2 f6 w-10 dn db-l'>
            <span className='pointer' onClick={this.changeSort(ORDER_BY_SIZE)}>
              Size {this.sortByIcon(ORDER_BY_SIZE)}
            </span>
          </div>
        </header>
        {this.files}
        {this.selectedMenu}
      </section>
    )
  }
}

const dropTarget = {
  drop: ({ onAddFiles }, monitor) => {
    if (monitor.didDrop()) {
      return
    }

    const item = monitor.getItem()
    onAddFiles(item)
  }
}

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})

export default DropTarget(NativeTypes.FILE, dropTarget, dropCollect)(FileList)

import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '../../components/checkbox/Checkbox'
import SelectedActions from '../selected-actions/SelectedActions'
import File from '../file/File'
import RenameModal from '../rename-modal/RenameModal'
import DeleteModal from '../delete-modal/DeleteModal'
import Overlay from '../../components/overlay/Overlay'
import { NativeTypes } from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
import { join } from 'path'

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

const defaultState = {
  selected: [],
  sortBy: ORDER_BY_NAME,
  sortAsc: true,
  isDragging: false,
  rename: {
    isOpen: false,
    path: '',
    filename: ''
  },
  delete: {
    isOpen: false,
    paths: [],
    files: 0,
    folders: 0
  }
}

class FileList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    files: PropTypes.array.isRequired,
    upperDir: PropTypes.object,
    root: PropTypes.string.isRequired,
    downloadProgress: PropTypes.number,
    maxWidth: PropTypes.string.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onInspect: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired
  }

  static defaultProps = {
    className: '',
    maxWidth: '100%'
  }

  state = defaultState

  resetState = (field) => this.setState({ [field]: defaultState[field] })

  get selectedFiles () {
    return this.state.selected.map(name =>
      this.props.files.find(el => el.name === name)
    ).filter(n => n)
  }

  get selectedMenu () {
    const unselectAll = () => this.toggleAll(false)
    const size = this.selectedFiles.reduce((a, b) => a + b.size, 0)
    const show = this.state.selected.length !== 0

    return (
      <SelectedActions
        className={`fixed transition-all bottom-0 right-0`}
        style={{
          maxWidth: this.props.maxWidth,
          transform: `translateY(${show ? '0' : '100%'})`
        }}
        unselect={unselectAll}
        remove={() => this.showDeleteModal(this.selectedFiles)}
        rename={() => this.showRenameModal(this.selectedFiles)}
        share={this.wrapWithSelected('onShare')}
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
        onNavigate={() => this.props.onNavigate(file.path)}
        onShare={() => this.props.onShare([file])}
        onDownload={() => this.props.onDownload([file])}
        onInspect={() => this.props.onInspect([file])}
        onDelete={() => this.showDeleteModal([file])}
        onRename={() => this.showRenameModal([file])}
        onAddFiles={this.props.onAddFiles}
        onMove={this.move}
        selected={this.state.selected.indexOf(file.name) !== -1}
        key={window.encodeURIComponent(file.name)}
        setIsDragging={this.isDragging}
        translucent={this.state.isDragging || (isOver && canDrop)}
        {...file}
      />
    ))
  }

  componentDidUpdate (prev) {
    if (this.props.root !== prev.root) {
      this.setState({ selected: [] })
      return
    }

    const selected = this.state.selected.filter(name => (
      this.props.files.find(el => el.name === name)
    ))

    if (selected.length !== this.state.selected.length) {
      this.setState({ selected })
    }
  }

  wrapWithSelected = (fn) => async () => {
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
      let basepath = parts.join('/')

      if (basepath === '') {
        basepath = '/'
      }

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

  showRenameModal = ([file]) => {
    this.setState({
      rename: {
        isOpen: true,
        path: file.path,
        filename: file.path.split('/').pop()
      }
    })
  }

  rename = (newName) => {
    const {filename, path} = this.state.rename
    this.resetState('rename')

    if (newName !== '' && newName !== filename) {
      this.props.onMove([path, path.replace(filename, newName)])
    }
  }

  showDeleteModal = (files) => {
    let filesCount = 0
    let foldersCount = 0

    files.forEach(file => file.type === 'file' ? filesCount++ : foldersCount++)

    this.setState({
      delete: {
        isOpen: true,
        files: filesCount,
        folders: foldersCount,
        paths: files.map(f => f.path)
      }
    })
  }

  delete = () => {
    const { paths } = this.state.delete

    this.resetState('delete')
    this.props.onDelete(paths)
  }

  render () {
    let { files, className, upperDir, connectDropTarget, isOver, canDrop } = this.props
    const { selected, isDragging, rename, delete: deleteModal } = this.state
    const allSelected = selected.length !== 0 && selected.length === files.length

    className = `FilesList no-select sans-serif border-box w-100 ${className}`

    if (selected.length !== 0) {
      className += ' mb6'
    }

    return connectDropTarget(
      <div>
        <section ref={(el) => { this.root = el }} className={className} style={{ minHeight: '500px' }}>
          <header className='hide-child-l gray pv3 flex items-center'>
            <div className='child float-on-left-l ph2 w2' style={allSelected ? {opacity: '1'} : null}>
              <Checkbox checked={allSelected} onChange={this.toggleAll} />
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
            <div className='pa2' style={{width: '2.5rem'}} />
          </header>
          { upperDir &&
            <File
              onNavigate={() => this.props.onNavigate(upperDir.path)}
              onInspect={() => this.props.onInspect([upperDir])}
              onAddFiles={this.props.onAddFiles}
              onMove={this.move}
              setIsDragging={this.isDragging}
              translucent={isDragging || (isOver && canDrop)}
              name='..'
              cantDrag
              cantSelect
              {...upperDir} />
          }
          {this.files}
          {this.selectedMenu}
        </section>

        <Overlay show={rename.isOpen} onLeave={() => this.resetState('rename')}>
          <RenameModal
            className='outline-0'
            filename={rename.filename}
            onCancel={() => this.resetState('rename')}
            onSubmit={this.rename} />
        </Overlay>

        <Overlay show={deleteModal.isOpen} onLeave={() => this.resetState('delete')}>
          <DeleteModal
            className='outline-0'
            files={deleteModal.files}
            folders={deleteModal.folders}
            onCancel={() => this.resetState('delete')}
            onDelete={this.delete} />
        </Overlay>
      </div>
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

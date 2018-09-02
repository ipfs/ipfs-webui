import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Checkbox from '../../components/checkbox/Checkbox'
import SelectedActions from '../selected-actions/SelectedActions'
import File from '../file/File'
import { NativeTypes } from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
import { join } from 'path'
import { sorts } from '../../bundles/files'
import { translate } from 'react-i18next'

class FileList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    files: PropTypes.array.isRequired,
    upperDir: PropTypes.object,
    sort: PropTypes.shape({
      by: PropTypes.string.isRequired,
      asc: PropTypes.bool.isRequired
    }),
    updateSorting: PropTypes.func.isRequired,
    root: PropTypes.string.isRequired,
    downloadProgress: PropTypes.number,
    maxWidth: PropTypes.string.isRequired,
    // React Drag'n'Drop
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    // Actions
    onShare: PropTypes.func.isRequired,
    onInspect: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onRename: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onAddFiles: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    // From i18next
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired
  }

  static defaultProps = {
    className: '',
    maxWidth: '100%'
  }

  state = {
    selected: [],
    focused: null,
    isDragging: false
  }

  filesRefs = {}

  get selectedFiles () {
    return this.state.selected.map(name =>
      this.props.files.find(el => el.name === name)
    ).filter(n => n)
  }

  get focusedFile () {
    if (this.state.focused === '..') {
      return this.props.upperDir
    }

    return this.props.files.find(el => el.name === this.state.focused)
  }

  get selectedMenu () {
    const unselectAll = () => this.toggleAll(false)
    const size = this.selectedFiles.reduce((a, b) => {
      if (b.cumulativeSize) {
        return a + b.cumulativeSize
      }

      return a + b.size
    }, 0)
    const show = this.state.selected.length !== 0

    return (
      <SelectedActions
        className={`fixed transition-all bottom-0 right-0`}
        style={{
          maxWidth: this.props.maxWidth,
          transform: `translateY(${show ? '0' : '100%'})`
        }}
        unselect={unselectAll}
        remove={() => this.props.onDelete(this.selectedFiles)}
        rename={() => this.props.onRename(this.selectedFiles)}
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
    const { files, isOver, canDrop } = this.props

    return files.map(file => (
      <File
        ref={r => { this.filesRefs[file.name] = r }}
        onSelect={this.toggleOne}
        onNavigate={() => this.props.onNavigate(file.path)}
        onShare={() => this.props.onShare([file])}
        onDownload={() => this.props.onDownload([file])}
        onInspect={() => this.props.onInspect([file])}
        onDelete={() => this.props.onDelete([file])}
        onRename={() => this.props.onRename([file])}
        onAddFiles={this.props.onAddFiles}
        onMove={this.move}
        focused={this.state.focused === file.name}
        selected={this.state.selected.indexOf(file.name) !== -1}
        key={window.encodeURIComponent(file.name)}
        setIsDragging={this.isDragging}
        translucent={this.state.isDragging || (isOver && canDrop)}
        {...file}
      />
    ))
  }

  componentDidMount () {
    document.addEventListener('keydown', this.keyHandler)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.keyHandler)
  }

  componentDidUpdate () {
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

  keyHandler = (e) => {
    const { selected, focused } = this.state

    if (e.key === 'Escape') {
      return this.setState({ selected: [], focused: null })
    }

    if (e.key === 'F2' && focused !== null && focused !== '..') {
      return this.props.onRename([this.focusedFile])
    }

    if (e.key === 'Delete' && selected.length > 0) {
      return this.props.onDelete(this.selectedFiles)
    }

    if (e.key === ' ' && focused !== null && focused !== '..') {
      e.preventDefault()
      return this.toggleOne(focused, true)
    }

    if ((e.key === 'Enter' || (e.key === 'ArrowRight' && e.metaKey)) && focused !== null) {
      return this.props.onNavigate(this.focusedFile.path)
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      let index = this.props.upperDir ? -1 : 0

      if (focused !== null) {
        const prev = this.props.files.findIndex(el => el.name === focused)
        index = (e.key === 'ArrowDown') ? prev + 1 : prev - 1
      }

      if (index === -1 && !this.props.upperDir) {
        return
      }

      if (index >= -1 && index < this.props.files.length) {
        let name

        if (index === -1) {
          name = '..'
        } else {
          name = this.props.files[index].name
        }

        this.setState({ focused: name })
        const domNode = ReactDOM.findDOMNode(this.filesRefs[name])
        domNode.scrollIntoView()
        domNode.querySelector('input[type="checkbox"]').focus()
      }
    }
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

    this.setState({ selected: selected.sort() })
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
    if (this.props.sort.by === order) {
      return this.props.sort.asc ? '↑' : '↓'
    }

    return null
  }

  changeSort = (order) => () => {
    if (order === this.props.sort.by) {
      this.props.updateSorting(order, !this.props.sort.asc)
    } else {
      this.props.updateSorting(order, true)
    }
  }

  isDragging = (is = true) => {
    this.setState({ isDragging: is })
  }

  render () {
    let { t, files, className, upperDir, connectDropTarget, isOver, canDrop } = this.props
    const { selected, isDragging } = this.state
    const allSelected = selected.length !== 0 && selected.length === files.length

    className = `FilesList no-select sans-serif border-box w-100 ${className}`

    if (selected.length !== 0) {
      className += ' mb6'
    }

    return connectDropTarget(
      <div style={{ marginBottom: '80px' }}>
        <section ref={(el) => { this.root = el }} className={className} style={{ minHeight: '500px' }}>
          <header className='hide-child-l gray pv3 flex items-center' style={{ paddingRight: '1px', paddingLeft: '1px' }}>
            <div className='child float-on-left-l ph2 w2' style={allSelected ? { opacity: '1' } : null}>
              <Checkbox checked={allSelected} onChange={this.toggleAll} />
            </div>
            <div className='ph2 f6 flex-grow-1 w-40'>
              <span onClick={this.changeSort(sorts.BY_NAME)} className='pointer'>
                {t('fileName')} {this.sortByIcon(sorts.BY_NAME)}
              </span>
            </div>
            <div className='ph2 f6 w-10 dn db-l'>
              <span className='pointer' onClick={this.changeSort(sorts.BY_SIZE)}>
                {t('size')} {this.sortByIcon(sorts.BY_SIZE)}
              </span>
            </div>
            <div className='pa2' style={{ width: '2.5rem' }} />
          </header>
          { upperDir &&
            <File
              ref={r => { this.filesRefs['..'] = r }}
              onNavigate={() => this.props.onNavigate(upperDir.path)}
              onInspect={() => this.props.onInspect([upperDir])}
              onAddFiles={this.props.onAddFiles}
              onMove={this.move}
              setIsDragging={this.isDragging}
              translucent={isDragging || (isOver && canDrop)}
              name='..'
              focused={this.state.focused === '..'}
              cantDrag
              cantSelect
              {...upperDir} />
          }
          {this.files}
          {this.selectedMenu}
        </section>
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

export default DropTarget(NativeTypes.FILE, dropTarget, dropCollect)(translate('files')(FileList))

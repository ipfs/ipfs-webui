/* global getComputedStyle */
import React, { Fragment } from 'react'
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { Trans, translate } from 'react-i18next'
import classnames from 'classnames'
import { join } from 'path'
import { sorts } from '../../bundles/files'
import { List, WindowScroller, AutoSizer } from 'react-virtualized'
// Reac DnD
import { NativeTypes } from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
// Components
import Checkbox from '../../components/checkbox/Checkbox'
import SelectedActions from '../selected-actions/SelectedActions'
import ContextMenu from '../context-menu/ContextMenu'
import File from '../file/File'
import LoadingAnimation from '../../components/loading-animation/LoadingAnimation'

export class FilesList extends React.Component {
  constructor (props) {
    super(props)
    this.contextMenuRef = React.createRef()
    this.listRef = React.createRef()
  }

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
    filesIsFetching: PropTypes.bool,
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
    className: ''
  }

  state = {
    selected: [],
    focused: null,
    firstVisibleRow: null,
    isDragging: false,
    contextMenu: {
      isOpen: false,
      translateX: 0,
      translateY: 0,
      currentFile: null
    }
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

    // We need this to get the width in ems
    const innerWidthEm = window.innerWidth / parseFloat(getComputedStyle(document.querySelector('body'))['font-size'])

    return (
      <SelectedActions
        className={`fixed transition-all bottom-0 right-0`}
        style={{
          maxWidth: innerWidthEm < 60 ? '100%' : `calc(100% - ${this.props.navbarWidth}px)`,
          transform: `translateY(${show ? '0' : '100%'})`
        }}
        unselect={unselectAll}
        remove={() => this.props.onDelete(this.selectedFiles)}
        rename={() => this.props.onRename(this.selectedFiles)}
        share={() => this.props.onShare(this.selectedFiles)}
        download={() => this.props.onDownload(this.selectedFiles)}
        inspect={() => this.props.onInspect(this.selectedFiles)}
        count={this.state.selected.length}
        downloadProgress={this.props.downloadProgress}
        size={size} />
    )
  }

  get contextMenu () {
    const { contextMenu } = this.state
    const isUpperDir = contextMenu.currentFile && contextMenu.currentFile.type === 'directory' && contextMenu.currentFile.name === '..'

    return (
      <div className='ph2 pv1 relative' style={{ width: '2.5rem' }}>
        <ContextMenu
          ref={this.contextMenuRef}
          isOpen={contextMenu.isOpen}
          translateX={contextMenu.translateX}
          translateY={contextMenu.translateY}
          handleClick={this.handleContextMenuClick}
          isUpperDir={isUpperDir}
          showDots={false}
          onShare={() => this.props.onShare([contextMenu.currentFile])}
          onDelete={() => this.props.onDelete([contextMenu.currentFile])}
          onRename={() => this.props.onRename([contextMenu.currentFile])}
          onInspect={() => this.props.onInspect([contextMenu.currentFile])}
          onDownload={() => this.props.onDownload([contextMenu.currentFile])}
          hash={contextMenu.currentFile && contextMenu.currentFile.hash} />
      </div>
    )
  }

  componentDidMount () {
    document.addEventListener('keyup', this.keyHandler)
  }

  componentWillUnmount () {
    document.removeEventListener('keyup', this.keyHandler)
  }

  componentDidUpdate () {
    const selected = this.state.selected.filter(name => (
      this.props.files.find(el => el.name === name)
    ))

    if (selected.length !== this.state.selected.length) {
      this.setState({ selected })
    }
  }

  keyHandler = (e) => {
    const { files, upperDir, filesIsFetching } = this.props
    const { selected, focused, firstVisibleRow } = this.state

    // Disable keyboard controls if fetching files
    if (filesIsFetching) {
      return
    }

    if (e.key === 'Escape') {
      this.setState({ selected: [], focused: null })
      return this.listRef.current.forceUpdateGrid()
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
      let index = upperDir ? -1 : 0

      if (focused !== null) {
        const prev = files.findIndex(el => el.name === focused)
        index = (e.key === 'ArrowDown') ? prev + 1 : prev - 1
      }

      if (index === -1 && !upperDir) {
        return
      }

      if (index >= -1 && index < files.length) {
        let name

        if (index === -1) {
          name = '..'
        } else {
          name = files[index].name
        }

        // If the file we are going to focus is out of view (removed
        // from the DOM by react-virtualized), focus the first visible file
        if (!this.filesRefs[name]) {
          name = files[firstVisibleRow].name
        }

        this.setState({ focused: name })
        const domNode = findDOMNode(this.filesRefs[name])
        domNode.scrollIntoView({ behaviour: 'smooth', block: 'center' })
        domNode.querySelector('input[type="checkbox"]').focus()
      }

      this.listRef.current.forceUpdateGrid()
    }
  }

  toggleAll = (checked) => {
    let selected = []

    if (checked) {
      selected = this.props.files.map(file => file.name)
    }

    this.setState({ selected: selected })
    this.listRef.current.forceUpdateGrid()
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
    this.listRef.current.forceUpdateGrid()
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
    const { sort, updateSorting } = this.props

    if (order === sort.by) {
      updateSorting(order, !sort.asc)
    } else {
      updateSorting(order, true)
    }

    this.listRef.current.forceUpdateGrid()
  }

  isDragging = (is = true) => {
    this.setState({ isDragging: is })
  }

  emptyRowsRenderer = () => {
    const { upperDir, isOver, canDrop, onNavigate, onAddFiles } = this.props
    const { isDragging, focused } = this.state

    return (
      <Fragment>
        { upperDir && <File
          ref={r => { this.filesRefs['..'] = r }}
          onNavigate={() => onNavigate(upperDir.path)}
          onAddFiles={onAddFiles}
          onMove={this.move}
          setIsDragging={this.isDragging}
          handleContextMenuClick={this.handleContextMenuClick}
          translucent={isDragging || (isOver && canDrop)}
          name='..'
          focused={focused === '..'}
          cantDrag
          cantSelect
          {...upperDir} /> }

        <Trans i18nKey='filesList.noFiles'>
          <div className='pv3 b--light-gray bt tc gray f6'>
            There are no available files. Add some!
          </div>
        </Trans>
      </Fragment>
    )
  }

  rowRenderer = ({ index, key, style }) => {
    const { files, upperDir, isOver, canDrop, onNavigate, onAddFiles } = this.props
    const { selected, focused, isDragging } = this.state

    if (upperDir) {
      // We want the `upperDir` to be the first item on the list
      if (index === 0) {
        return (
          <div key={key} style={style}>
            <File
              ref={r => { this.filesRefs['..'] = r }}
              onNavigate={() => onNavigate(upperDir.path)}
              onAddFiles={onAddFiles}
              onMove={this.move}
              setIsDragging={this.isDragging}
              handleContextMenuClick={this.handleContextMenuClick}
              translucent={isDragging || (isOver && canDrop)}
              name='..'
              focused={focused === '..'}
              cantDrag
              cantSelect
              {...upperDir} />
          </div>
        )
      }
      // Decrease the index to stay inside the `files` array range
      index--
    }

    return (
      <div key={key} style={style}>
        <File
          {...files[index]}
          ref={r => { this.filesRefs[files[index].name] = r }}
          name={files[index].name}
          onSelect={this.toggleOne}
          onNavigate={() => onNavigate(files[index].path)}
          onAddFiles={onAddFiles}
          onMove={this.move}
          focused={focused === files[index].name}
          selected={selected.indexOf(files[index].name) !== -1}
          setIsDragging={this.isDragging}
          handleContextMenuClick={this.handleContextMenuClick}
          translucent={isDragging || (isOver && canDrop)} />
      </div>
    )
  }

  onRowsRendered = ({ startIndex }) => this.setState({ firstVisibleRow: startIndex })

  handleContextMenuClick = (ev, clickType, file, dotsPosition) => {
    // This is needed to disable the native OS right-click menu
    // and deal with the clicking on the ContextMenu options
    if (ev !== undefined && typeof ev !== 'string') {
      ev.preventDefault()
      ev.persist()
    }

    const ctxMenu = findDOMNode(this.contextMenuRef.current)
    const ctxMenuPosition = ctxMenu.getBoundingClientRect()

    if (clickType === 'RIGHT') {
      this.setState(state => ({
        ...state,
        contextMenu: {
          ...state.contextMenu,
          isOpen: !state.contextMenu.isOpen,
          translateX: (ctxMenuPosition.x + ctxMenuPosition.width / 2) - ev.clientX,
          translateY: (ctxMenuPosition.y + ctxMenuPosition.height / 2) - ev.clientY - 10,
          currentFile: file
        }
      }))
    } else {
      this.setState(state => ({
        ...state,
        contextMenu: {
          ...state.contextMenu,
          isOpen: !state.contextMenu.isOpen,
          translateX: (ctxMenuPosition.x + ctxMenuPosition.width / 2) - (dotsPosition && dotsPosition.x) - 19,
          translateY: (ctxMenuPosition.y + ctxMenuPosition.height / 2) - (dotsPosition && dotsPosition.y) - 30,
          currentFile: file
        }
      }))
    }
  }

  render () {
    let { t, files, className, upperDir, showLoadingAnimation, connectDropTarget } = this.props
    const { selected } = this.state
    const allSelected = selected.length !== 0 && selected.length === files.length
    const rowCount = files.length && upperDir ? files.length + 1 : files.length
    const checkBoxCls = classnames({
      'o-1': allSelected,
      'o-70': !allSelected
    }, ['pl2 w2 glow'])

    className = `FilesList no-select sans-serif border-box w-100 flex flex-column ${className}`

    return connectDropTarget(
      <section ref={(el) => { this.root = el }} className={className}>
        { showLoadingAnimation
          ? <LoadingAnimation />
          : <Fragment>
            <header className='gray pv3 flex items-center flex-none' style={{ paddingRight: '1px', paddingLeft: '1px' }}>
              <div className={checkBoxCls}>
                <Checkbox checked={allSelected} onChange={this.toggleAll} />
              </div>
              <div className='ph2 f6 flex-auto'>
                <span onClick={this.changeSort(sorts.BY_NAME)} className='pointer'>
                  {t('fileName')} {this.sortByIcon(sorts.BY_NAME)}
                </span>
              </div>
              <div className='pl2 pr4 tr f6 flex-none dn db-l'>
                <span className='pointer' onClick={this.changeSort(sorts.BY_SIZE)}>
                  {t('size')} {this.sortByIcon(sorts.BY_SIZE)}
                </span>
              </div>
              <div className='pa2' style={{ width: '2.5rem' }} />
            </header>
            <WindowScroller>
              {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <div className='flex-auto'>
                  <AutoSizer disableHeight>
                    {({ width }) => (
                      <List
                        ref={this.listRef}
                        autoHeight
                        width={width}
                        height={height}
                        className='outline-0'
                        rowCount={rowCount}
                        rowHeight={55}
                        rowRenderer={this.rowRenderer}
                        noRowsRenderer={this.emptyRowsRenderer}
                        onRowsRendered={this.onRowsRendered}
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        scrollTop={scrollTop} />
                    )}
                  </AutoSizer>
                </div>
              )}
            </WindowScroller>
            {this.contextMenu}
            {this.selectedMenu}
          </Fragment> }
      </section>
    )
  }
}

const dropTarget = {
  drop: ({ onAddFiles }, monitor) => {
    if (monitor.didDrop()) {
      return
    }
    const { filesPromise } = monitor.getItem()
    onAddFiles(filesPromise)
  }
}

const dropCollect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
})

export const FilesListWithDropTarget = DropTarget(NativeTypes.FILE, dropTarget, dropCollect)(translate('files')(FilesList))

export default connect(
  'selectNavbarWidth',
  'selectFilesIsFetching',
  'selectShowLoadingAnimation',
  FilesListWithDropTarget
)

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {join, dirname, basename} from 'path'
import {includes} from 'lodash-es'
import {toastr} from 'react-redux-toastr'
import {withRouter} from 'react-router'
import {pages, files} from '../actions'

import Tree from './../components/files/tree'
import ActionBar from './../components/files/action-bar'
import Breadcrumbs from './../components/files/breadcrumbs'

class FilesExplorer extends Component {
  componentWillMount () {
    this.props.load()
  }

  componentDidMount () {
    const path = this.props.match.params[0]
    const {setRoot} = this.props

    if (path) {
      setRoot(join('/', path))
    } else {
      setRoot('/')
    }

    document.addEventListener('keydown', this._onKeyDown)
  }

  componentWillReceiveProps (nextProps) {
    const locationChanged = nextProps.location !== this.props.location
    const {setRoot} = this.props

    if (locationChanged) {
      setRoot(join('/', nextProps.match.params[0]))
    }
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this._onKeyDown)
    this.props.leave()
  }

  _onKeyDown = (event) => {
    const {deselectAll} = this.props

    switch (event.which) {
      case 27:
        // Escape
        event.preventDefault()
        deselectAll()
        break
      case 46:
        // Delete
        event.preventDefault()
        this._onRemoveDir()
        break
      case 113:
        // F2
        event.preventDefault()
        this._onMoveDir()
        break
    }
  }

  selectRangeFromCurrent = (toFile) => {
    const {
      selected,
      list
    } = this.props

    let fi = 0
    let la = list.indexOf(toFile)

    for (let i = 0; i < list.length; i++) {
      if (list[i].Name !== basename(selected[0])) {
        continue
      }

      if (la > i) {
        fi = i + 1
      } else {
        fi = la
        la = i - 1
      }
      break
    }

    this.selectAllBetween(fi, la)
  }

  selectAllBetween = (fi, la) => {
    const {
      root,
      list,
      select
    } = this.props

    for (let i = fi; i <= la; i++) {
      const filePath = join(root, list[i].Name)
      select(filePath)
    }
  }

  _onRowClick = (file, shiftKey, ctrlKey) => {
    const {
      root,
      selected,
      select,
      deselect,
      deselectAll
    } = this.props

    const filePath = join(root, file.Name)
    const currentlySelected = includes(selected, filePath)

    if (currentlySelected) {
      deselect(filePath)
    } else if (ctrlKey && !currentlySelected) {
      select(filePath)
    } else if (shiftKey && !currentlySelected && selected.length === 1) {
      this.selectRangeFromCurrent(file)
    } else {
      deselectAll()
      select(filePath)
    }
  }

  _onRowContextMenu = (file, shiftKey) => {
    const {
      root,
      selected,
      select,
      deselectAll
    } = this.props
    const filePath = join(root, file.Name)
    const currentlySelected = includes(selected, filePath)

    if (shiftKey) {
      select(filePath)
    } else {
      if (!currentlySelected) {
        deselectAll()
      }
      select(filePath)
    }
  }

  _onRowDoubleClick = (file, shiftKey) => {
    const {root, deselectAll, history} = this.props
    const filePath = join(root, file.Name)
    deselectAll()

    if (file.Type === 'directory') {
      history.push(join('/files/explorer', filePath))
    } else {
      history.push(join('/files/preview', filePath))
    }
  }

  _onCreateDir = (event) => {
    this.props.createTmpDir(this.props.root)
  };

  _onCreateFiles = (files) => {
    this.props.createFiles(this.props.root, files)
  }

  _onCancelCreateDir = (event) => {
    this.props.rmTmpDir()
  }

  _onRemoveDir = () => {
    const {selected, removeDir} = this.props
    const count = selected.length
    const plural = count > 1 ? 'files' : 'file'
    const msg = `Are you sure you want to delete ${count} ${plural}?`
    toastr.confirm(msg, {
      onOk () {
        removeDir()
      }
    })
  }

  _onMoveDir = () => {
    const {selected, moveDir} = this.props
    const count = selected.length

    if (count !== 1) {
      return
    }

    const oldName = selected[0]
    // TODO: prettier prompt
    const newName = join(dirname(oldName), window.prompt('Insert the name name:'))
    moveDir(oldName, newName)
  }

  render () {
    const {list, root, tmpDir, selected, history} = this.props

    return (
      <div className='files'>
        <Breadcrumbs
          root={root}
          history={history}
        />
        <ActionBar
          selectedFiles={selected}
          onCreateDir={this._onCreateDir}
          onRemoveDir={this._onRemoveDir}
          onMoveDir={this._onMoveDir}
          onCreateFiles={this._onCreateFiles} />
        <Tree
          files={list}
          tmpDir={tmpDir}
          root={root}
          selectedFiles={selected}
          onRowClick={this._onRowClick}
          onRowContextMenu={this._onRowContextMenu}
          onRowDoubleClick={this._onRowDoubleClick}
          onTmpDirChange={this.props.setTmpDirName}
          onCreateDir={this.props.createDir}
          onCancelCreateDir={this._onCancelCreateDir}
          onCreateFiles={this._onCreateFiles}
          onRemoveDir={this._onRemoveDir}
          onMoveDir={this._onMoveDir} />
      </div>
    )
  }
}

FilesExplorer.propTypes = {
  // state
  list: PropTypes.array.isRequired,
  root: PropTypes.string.isRequired,
  tmpDir: PropTypes.shape({
    root: PropTypes.string.isRequired,
    name: PropTypes.string
  }),
  location: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.object.isRequired
  }),
  selected: PropTypes.array.isRequired,
  // actions
  setRoot: PropTypes.func.isRequired,
  createTmpDir: PropTypes.func.isRequired,
  setTmpDirName: PropTypes.func.isRequired,
  createDir: PropTypes.func.isRequired,
  removeDir: PropTypes.func.isRequired,
  moveDir: PropTypes.func.isRequired,
  rmTmpDir: PropTypes.func.isRequired,
  select: PropTypes.func.isRequired,
  deselect: PropTypes.func.isRequired,
  deselectAll: PropTypes.func.isRequired,
  createFiles: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  load: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired
}

function mapStateToProps (state, ownProps) {
  const {files} = state

  return {
    ...files
  }
}

export default withRouter(connect(mapStateToProps, {
  setRoot: files.filesSetRoot,
  createTmpDir: files.filesCreateTmpDir,
  setTmpDirName: files.filesSetTmpDirName,
  createDir: files.filesCreateDir,
  removeDir: files.filesRemoveDir,
  moveDir: files.filesMoveDir,
  rmTmpDir: files.filesRmTmpDir,
  select: files.filesSelect,
  deselect: files.filesDeselect,
  deselectAll: files.filesDeselectAll,
  createFiles: files.filesCreateFiles,
  ...pages.files
})(FilesExplorer))

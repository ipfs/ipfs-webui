import React, {PropTypes, Component} from 'react'
import {isEmpty, includes, map} from 'lodash-es'
import {join} from 'path'
import {DropTarget} from 'react-dnd'
import {NativeTypes} from 'react-dnd-html5-backend'
import classnames from 'classnames'

import RowInput from './tree/row-input'
import Row from './tree/row'
import FilesContextMenu from './context-menu'

function readAsBuffer (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve({
        content: new Buffer(reader.result),
        name: file.name
      })
    }
    reader.onerror = (event) => {
      reject(reader.error)
    }

    reader.readAsArrayBuffer(file)
  })
}

const fileTarget = {
  drop (props, monitor) {
    Promise
      .all(map(monitor.getItem().files, readAsBuffer))
      .then((files) => {
        props.onCreateFiles(files)
      })
  }
}

class Tree extends Component {
  static propTypes = {
    files: PropTypes.array,
    selectedFiles: PropTypes.array,
    tmpDir: PropTypes.shape({
      root: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    root: PropTypes.string,
    onRowClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onTmpDirChange: PropTypes.func.isRequired,
    onCreateDir: PropTypes.func.isRequired,
    onCancelCreateDir: PropTypes.func.isRequired,
    // eslint-disable-next-line
    onCreateFiles: PropTypes.func.isRequired,
    onRemoveDir: PropTypes.func.isRequired,
    // react-dnd
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired
  };

  static defaultProps = {
    root: '/',
    files: [],
    selectedFiles: [],
    onRowClick () {},
    onRowContextMenu () {},
    onRowDoubleClick () {}
  };

  _onTmpDirChange = ({target}) => {
    this.props.onTmpDirChange(target.value)
  };

  _onDirCreateBlur = (event) => {
    if (isEmpty(event.target.value)) {
      this.props.onCancelCreateDir()
    } else {
      this.props.onCreateDir()
    }
  };

  _isSelected = (file) => {
    const {selectedFiles, root} = this.props
    return includes(selectedFiles, join(root, file.Name))
  };

  render () {
    let tmpDir
    if (this.props.tmpDir) {
      tmpDir = (
        <RowInput
          onChange={this._onTmpDirChange}
          value={this.props.tmpDir.name}
          onKeyEnter={this.props.onCreateDir}
          onKeyEsc={this.props.onCancelCreateDir}
          onBlur={this._onDirCreateBlur}
        />
      )
    }

    const files = this.props.files.map((file, i) => (
      <Row
        key={i}
        file={file}
        selected={this._isSelected(file)}
        onClick={this.props.onRowClick}
        onContextMenu={this.props.onRowContextMenu}
        onDoubleClick={this.props.onRowDoubleClick}
        onRemoveDir={this.props.onRemoveDir} />
    )).concat([tmpDir])

    const {isOver, canDrop} = this.props
    const className = classnames('files-drop', {isOver, canDrop})

    return this.props.connectDropTarget(
      <div>
        <div className={className}>
          {!isOver && canDrop && 'Drag your files here'}
          {isOver && 'Drop your files'}
        </div>
        <div className='files-tree'>
          <div className='files-tree-header'>
            <div className='item'>Name</div>
            <div className='item'>Size</div>
          </div>
          <div className='files-tree-body'>
            {files}
          </div>
        </div>
        <FilesContextMenu />
      </div>
    )
  }
}

export default DropTarget(
  NativeTypes.FILE,
  fileTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  })
)(Tree)

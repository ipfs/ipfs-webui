import React, {PropTypes, Component} from 'react'
import {Row, Col} from 'react-bootstrap'
import {connect} from 'react-redux'
import {join} from 'path'
import {includes} from 'lodash-es'

import {files} from '../actions'

import Tree from './../components/files/tree'
import ActionBar from './../components/files/action-bar'
import Breadcrumbs from './../components/files/breadcrumbs'

class FilesExplorer extends Component {
  static propTypes = {
    // state
    list: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired,
    tmpDir: PropTypes.shape({
      root: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    selected: PropTypes.array.isRequired,
    // actions
    setRoot: PropTypes.func.isRequired,
    createTmpDir: PropTypes.func.isRequired,
    setTmpDirName: PropTypes.func.isRequired,
    createDir: PropTypes.func.isRequired,
    rmTmpDir: PropTypes.func.isRequired,
    select: PropTypes.func.isRequired,
    deselect: PropTypes.func.isRequired,
    deselectAll: PropTypes.func.isRequired
  };

  _onRowClick = (file) => {
    const {root, selected, select, deselect} = this.props
    const filePath = join(root, file.Name)

    if (includes(selected, filePath)) {
      deselect(filePath)
    } else {
      select(filePath)
    }
  };

  _onRowDoubleClick = (file) => {
    const {root, deselectAll, setRoot} = this.props

    deselectAll()
    if (file.Type === 'directory') {
      setRoot(join(root, file.Name))
    } else {
      // TODO: File Preview
    }
  };

  _onCreateDir = (event) => {
    this.props.createTmpDir(this.props.root)
  };

  _onCancelCreateDir = (event) => {
    this.props.rmTmpDir()
  };

  render () {
    const {list, root, setRoot, tmpDir, selected} = this.props

    return (
      <div className='files-explorer'>
        <Row>
          <Col sm={12}>
            <Row>
              <Col sm={12}>
                <Breadcrumbs
                  files={list}
                  root={root}
                  setRoot={setRoot}
                />
                <ActionBar
                  onCreateDir={this._onCreateDir}/>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Tree
                  files={list}
                  tmpDir={tmpDir}
                  root={root}
                  selectedFiles={selected}
                  onRowClick={this._onRowClick}
                  onRowDoubleClick={this._onRowDoubleClick}
                  onTmpDirChange={this.props.setTmpDirName}
                  onCreateDir={this.props.createDir}
                  onCancelCreateDir={this._onCancelCreateDir}/>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps (state) {
  const {files} = state

  return files
}

export default connect(mapStateToProps, {
  setRoot: files.filesSetRoot,
  createTmpDir: files.filesCreateTmpDir,
  setTmpDirName: files.filesSetTmpDirName,
  createDir: files.filesCreateDir,
  rmTmpDir: files.filesRmTmpDir,
  select: files.filesSelect,
  deselect: files.filesDeselect,
  deselectAll: files.filesDeselectAll
})(FilesExplorer)

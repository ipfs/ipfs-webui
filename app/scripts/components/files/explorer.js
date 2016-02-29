import React, {PropTypes, Component} from 'react'
import {Row, Col} from 'react-bootstrap'
import debug from 'debug'
import {join} from 'path'

import Tree from './tree'
import ActionBar from './action-bar'
import Breadcrumbs from './breadcrumbs'

const log = debug('pages:files')
log.error = debug('pages:files:error')

export default class FilesExplorer extends Component {
  static propTypes = {
    files: PropTypes.array.isRequired,
    root: PropTypes.string.isRequired,
    tmpDir: PropTypes.shape({
      root: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    setRoot: PropTypes.func.isRequired,
    addTmpDir: PropTypes.func.isRequired,
    setTmpDirName: PropTypes.func.isRequired,
    createDir: PropTypes.func.isRequired
  };

  _onRowClick = (file) => {
    const {root} = this.props

    if (file.Type === 'directory') {
      this.props.setRoot(join(root, file.Name))
    } else {
      // TODO: File Preview
    }
  };

  _onAddDirectory = (event) => {
    this.props.addTmpDir(this.props.root)
  };

  render () {
    const {files, root, setRoot, tmpDir} = this.props

    return (
      <div className='files-explorer'>
        <Row>
          <Col sm={12}>
            <Row>
              <Col sm={12}>
                <Breadcrumbs
                  files={files}
                  root={root}
                  setRoot={setRoot}
                />
                <ActionBar
                  onAddDirectory={this._onAddDirectory}/>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Tree
                  files={files}
                  tmpDir={tmpDir}
                  onRowClick={this._onRowClick}
                  onTmpDirChange={this.props.setTmpDirName}
                  onCreateDir={this.props.createDir}/>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

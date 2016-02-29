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
    setRoot: PropTypes.func.isRequired
  };

  _onRowClick = (file) => {
    const {root} = this.props

    if (file.Type === 'directory') {
      this.props.setRoot(join(root, file.Name))
    } else {
      // TODO: File Preview
    }
  };

  render () {
    const {files, root, setRoot} = this.props

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
                <ActionBar />
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Tree
                  files={files}
                  onRowClick={this._onRowClick}
                  />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

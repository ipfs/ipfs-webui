import React, {PropTypes, Component} from 'react'
import {Table} from 'react-bootstrap'
import {isEmpty} from 'lodash-es'

import RowInput from './tree/row-input'
import Row from './tree/row'

export default class Tree extends Component {
  static propTypes = {
    files: PropTypes.array,
    tmpDir: PropTypes.shape({
      root: PropTypes.string.isRequired,
      name: PropTypes.string
    }),
    onRowClick: PropTypes.func,
    onTmpDirChange: PropTypes.func.isRequired,
    onCreateDir: PropTypes.func.isRequired,
    onCancelCreateDir: PropTypes.func.isRequired
  };

  static defaultProps = {
    files: [],
    onRowClick () {}
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
        onClick={this.props.onRowClick}/>
    )).concat([tmpDir])

    return (
      <Table responsive className='files-tree'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {files}
        </tbody>
      </Table>
    )
  }
}

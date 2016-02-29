import React, {PropTypes, Component} from 'react'
import {Table} from 'react-bootstrap'
import pretty from 'prettysize'

import Icon from '../../views/icon'

function renderType (type) {
  if (type === 'directory') return <Icon glyph='folder' large />
  return <Icon glyph='file' large />
}

class Row extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
  };

  _onClick = (event) => {
    this.props.onClick(this.props.file)
  };

  render () {
    const {file} = this.props
    return (
      <tr onDoubleClick={this._onClick} className='file-row'>
        <td>
          {renderType(file.Type)}
          {file.Name}
        </td>
        <td>
          {file.Type === 'directory' ? '-' : pretty(file.Size)}
        </td>
      </tr>
    )
  }
}

export default class Tree extends Component {
  static propTypes = {
    files: PropTypes.array,
    onRowClick: PropTypes.func
  };

  static defaultProps = {
    files: [],
    onRowClick () {}
  };

  render () {
    const files = this.props.files.map((file, i) => (
      <Row
        key={i}
        file={file}
        onClick={this.props.onRowClick}/>
    ))

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

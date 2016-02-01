import React, {PropTypes, Component} from 'react'
import {Table} from 'react-bootstrap'
import pretty from 'prettysize'

import Icon from '../views/icon'

function renderType (type) {
  if (type === 'directory') return <Icon glyph='folder' large />
  return <Icon glyph='file' large />
}

function Row ({file, onClick}) {
  const click = event => {
    onClick(file)
  }

  return (
    <tr onClick={click} className='file-row'>
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

export default class FilesExplorer extends Component {
  static propTypes = {
    files: PropTypes.array,
    onRowClick: PropTypes.func
  };

  static defaultProps = {
    files: [],
    onRowClick () {}
  };

  state = {
    root: '/'
  };

  render () {
    const files = this.props.files
      .map((file, i) => (
        <Row key={i} file={file} onClick={this.props.onRowClick} />
      ))

    return (
      <Table responsive>
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

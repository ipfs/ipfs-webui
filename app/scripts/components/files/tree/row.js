import React, {PropTypes, Component} from 'react'
import pretty from 'prettysize'

import Icon from '../../../views/icon'

function renderType (type) {
  if (type === 'directory') return <Icon glyph='folder' large />
  return <Icon glyph='file' large />
}

export default class Row extends Component {
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

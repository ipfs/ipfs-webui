import React, {PropTypes, Component} from 'react'
import pretty from 'prettysize'
import classnames from 'classnames'

import Icon from '../../../views/icon'

function renderType (type) {
  if (type === 'directory') return <Icon glyph='folder' large />
  return <Icon glyph='file' large />
}

export default class Row extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    selected: PropTypes.bool
  };

  static defaultProps = {
    selected: false
  };

  _onClick = (event) => {
    this.props.onClick(this.props.file)
  };

  _onDoubleClick = (event) => {
    this.props.onDoubleClick(this.props.file)
  };

  render () {
    const {file, selected} = this.props
    const className = classnames('file-row', {selected})
    return (
      <tr
        onClick={this._onClick}
        onDoubleClick={this._onDoubleClick}
        className={className}>
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

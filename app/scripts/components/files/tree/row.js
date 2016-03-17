import React, {PropTypes, Component} from 'react'
import pretty from 'prettysize'
import classnames from 'classnames'
import {ContextMenuLayer} from 'react-contextmenu'

import Icon from '../../../views/icon'

function renderType (type) {
  if (type === 'directory') return <Icon glyph='folder' large />
  return <Icon glyph='file' large />
}

class Row extends Component {
  static propTypes = {
    file: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onContextMenu: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    onRemoveDir: PropTypes.func.isRequired,
    selected: PropTypes.bool
  };

  static defaultProps = {
    selected: false
  };

  _onClick = (event) => {
    event.preventDefault()
    this.props.onClick(this.props.file, event.shiftKey)
  };

  _onContextMenu = (event) => {
    event.preventDefault()
    this.props.onContextMenu(this.props.file, event.shiftKey)
  };

  _onDoubleClick = (event) => {
    event.preventDefault()
    this.props.onDoubleClick(this.props.file)
  };

  render () {
    const {file, selected} = this.props
    const className = classnames('file-row', {selected})
    return (
      <div
        onClick={this._onClick}
        onContextMenu={this._onContextMenu}
        onDoubleClick={this._onDoubleClick}
        className={className}>
        <div className='name'>
          {renderType(file.Type)}
          {file.Name}
        </div>
        <div className='size'>
          {file.Type === 'directory' ? '-' : pretty(file.Size)}
        </div>
      </div>
    )
  }
}

export default ContextMenuLayer('files-context-menu', (props) => ({
  file: props.file,
  onRemove: props.onRemoveDir
}))(Row)

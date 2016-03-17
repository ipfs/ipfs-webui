import React, {Component, PropTypes} from 'react'
import {ContextMenu, MenuItem, connect} from 'react-contextmenu'

class FilesContextMenu extends Component {
  static propTypes = {
    item: PropTypes.shape({
      file: PropTypes.shape({
        Name: PropTypes.string.isRequired
      }),
      onRemove: PropTypes.func
    }).isRequired
  };

  _onDelete = (event, data) => {
    this.props.item.onRemove(this.props.item.file.Name)
  };

  render () {
    return (
      <ContextMenu identifier='files-context-menu'>
        <MenuItem onClick={this._onDelete}>
          Delete
        </MenuItem>
      </ContextMenu>
    )
  }
}

export default connect(FilesContextMenu)

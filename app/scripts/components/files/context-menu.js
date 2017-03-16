import React, {Component, PropTypes} from 'react'
import {ContextMenu, MenuItem} from 'react-contextmenu'

class FilesContextMenu extends Component {
  static propTypes = {
    selectedFiles: PropTypes.array.isRequired,
    onRemoveDir: PropTypes.func
  }

  render () {
    const {selectedFiles, onRemoveDir} = this.props
    return (
      <ContextMenu id='files-context-menu'>
        <MenuItem onClick={onRemoveDir}>
          {selectedFiles.length > 1 ? `Delete ${selectedFiles.length} files` : 'Delete'}
        </MenuItem>
      </ContextMenu>
    )
  }
}

export default FilesContextMenu

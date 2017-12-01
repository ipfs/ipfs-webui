import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ContextMenu, MenuItem} from 'react-contextmenu'

class FilesContextMenu extends Component {
  render () {
    const {selectedFiles, onRemoveDir, onMoveDir, onCopyHash} = this.props
    return (
      <ContextMenu id='files-context-menu'>
        <MenuItem onClick={onRemoveDir}>
          {selectedFiles.length > 1 ? `Delete ${selectedFiles.length} files` : 'Delete'}
        </MenuItem>
        <MenuItem onClick={onMoveDir}>
          Rename
        </MenuItem>
        {selectedFiles.length === 1 && onCopyHash ? (
          <MenuItem onClick={onCopyHash}>
            Copy hash to clipboard
          </MenuItem>
        ) : null}
      </ContextMenu>
    )
  }
}

FilesContextMenu.propTypes = {
  selectedFiles: PropTypes.array.isRequired,
  onCopyHash: PropTypes.func,
  onRemoveDir: PropTypes.func,
  onMoveDir: PropTypes.func.isRequired
}

export default FilesContextMenu

import React, {Component, PropTypes} from 'react'
import {isEmpty} from 'lodash-es'

import Icon from '../../views/icon'

class ActionBar extends Component {
  render () {
    const {selectedFiles, onRemoveDir, onCreateDir} = this.props
    let fileActions

    if (!isEmpty(selectedFiles)) {
      const length = selectedFiles.length
      const plural = length > 1 ? 's' : ''
      const count = `${length} file${plural}`

      fileActions = (
        <div className='action-bar-file-actions'>
          <a onClick={onRemoveDir}>
            <Icon glyph='minus' />
            Delete {count}
          </a>
        </div>
      )
    }

    return (
      <div className='action-bar'>
        <div className='action-bar-general-actions'>
          <a onClick={onCreateDir}>
            <Icon glyph='plus' />
            Create Folder
          </a>
        </div>
        {fileActions}
      </div>
    )
  }
}

ActionBar.propTypes = {
  onCreateDir: PropTypes.func.isRequired,
  onRemoveDir: PropTypes.func.isRequired,
  selectedFiles: PropTypes.array.isRequired
}

export default ActionBar

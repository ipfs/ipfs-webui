import React from 'react'
import PropTypes from 'prop-types'
import Icon from '../../icons/StrokeDecentralization'
import isIPFS from 'is-ipfs'

import TextInputModal from '../text-input-modal/TextInputModal'

class ByPathModal extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  }

  render () {
    let {onCancel, onSubmit, className, ...props} = this.props

    return (
      <TextInputModal
        validate={isIPFS.ipfsPath}
        onCancel={onCancel}
        onSubmit={onSubmit}
        className={className}
        title='Add by path'
        description='Insert the path to add.'
        icon={Icon}
        submitText='Add'
        {...props}
      />
    )
  }
}

export default ByPathModal

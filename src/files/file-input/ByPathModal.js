import React from 'react'
import PropTypes from 'prop-types'
import isIPFS from 'is-ipfs'
import Icon from '../../icons/StrokeDecentralization'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

function ByPathModal ({ onCancel, onSubmit, className, ...props }) {
  return (
    <TextInputModal
      validate={(p) => isIPFS.ipfsPath(p.trim())}
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title='Add by path'
      description='Insert the path to add.'
      icon={Icon}
      submitText='Add'
      {...props}
    />
  )
}

ByPathModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default ByPathModal

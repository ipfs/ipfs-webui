import React from 'react'
import PropTypes from 'prop-types'
import FolderIcon from '../../icons/StrokeFolder'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

function NewFolderModal ({ onCancel, onSubmit, className, ...props }) {
  return (
    <TextInputModal
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title='New folder'
      description='Insert the name of the folder you want to create.'
      icon={FolderIcon}
      submitText='Create'
      {...props}
    />
  )
}

NewFolderModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default NewFolderModal

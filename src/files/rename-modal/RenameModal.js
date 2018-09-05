import React from 'react'
import PropTypes from 'prop-types'
import PencilIcon from '../../icons/StrokePencil'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

function RenameModal ({ onCancel, onSubmit, filename, folder, className, ...props }) {
  return (
    <TextInputModal
      onCancel={onCancel}
      onSubmit={onSubmit}
      mustBeDifferent
      className={className}
      defaultValue={filename}
      title={`Rename ${folder ? 'Folder' : 'File'}`}
      description={`Choose a new name for this ${folder ? 'folder' : 'file'}.`}
      icon={PencilIcon}
      submitText='Save'
      {...props}
    />
  )
}

RenameModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  filename: PropTypes.string.isRequired,
  folder: PropTypes.bool
}

RenameModal.defaultProps = {
  className: '',
  folder: false
}

export default RenameModal

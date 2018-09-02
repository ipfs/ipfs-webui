import React from 'react'
import PropTypes from 'prop-types'
import PencilIcon from '../../icons/StrokePencil'
import TextInputModal from '../../components/text-input-modal/TextInputModal'
import { translate } from 'react-i18next'

function RenameModal ({ t, tReady, onCancel, onSubmit, filename, folder, className, ...props }) {
  const context = folder ? 'folder' : 'file'

  return (
    <TextInputModal
      onCancel={onCancel}
      onSubmit={onSubmit}
      mustBeDifferent
      className={className}
      defaultValue={filename}
      title={t('renameModal.title', { context })}
      description={t('renameModal.description', { context })}
      icon={PencilIcon}
      submitText={t('actions.save')}
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

export default translate('files')(RenameModal)

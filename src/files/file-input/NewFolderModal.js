import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import FolderIcon from '../../icons/StrokeFolder'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

function NewFolderModal ({ t, tReady, onCancel, onSubmit, className, ...props }) {
  return (
    <TextInputModal
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title={t('newFolderModal.title')}
      description={t('newFolderModal.description')}
      icon={FolderIcon}
      submitText={t('actions.create')}
      {...props}
    />
  )
}

NewFolderModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

export default translate('files')(NewFolderModal)

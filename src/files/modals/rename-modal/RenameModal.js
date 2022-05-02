import React from 'react'
import PropTypes from 'prop-types'
import PencilIcon from '../../../icons/StrokePencil'
import TextInputModal from '../../../components/text-input-modal/TextInputModal'
import { withTranslation } from 'react-i18next'
import { StyledModalTitle, StyledIconContainer } from '../new-folder-modal/NewFolderModal'
import RenameFileIcon from '../../../icons/retro/files/RenameFileIcon'
function RenameModal ({ t, tReady, onCancel, onSubmit, filename, folder, className, ...props }) {
  const context = folder ? 'Folder' : 'File'

  return (
    <TextInputModal
      onCancel={onCancel}
      onSubmit={onSubmit}
      mustBeDifferent
      className={className}
      defaultValue={filename}
      title={
        <StyledModalTitle>
          <StyledIconContainer>
            <RenameFileIcon />
          </StyledIconContainer>
          {t(`renameModal.title${context}`)}
        </StyledModalTitle>}
      description={t(`renameModal.description${context}`)}
      Icon={PencilIcon}
      submitText={t('app:actions.save')}
      {...props} />
  )
}

RenameModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  filename: PropTypes.string.isRequired,
  folder: PropTypes.bool,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

RenameModal.defaultProps = {
  className: '',
  folder: false
}

export default withTranslation('files')(RenameModal)

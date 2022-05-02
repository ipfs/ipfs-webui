/* eslint-disable space-before-function-paren */
import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import FolderIcon from '../../../icons/StrokeFolder'
import FolderOutlineIcon from '../../../icons/retro/files/FolderOutlineIcon'
import TextInputModal from '../../../components/text-input-modal/TextInputModal'
import styled from 'styled-components'

export const StyledModalTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

export const StyledIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  width: 50px;
  height: 50px;

`

function NewFolderModal({ t, tReady, onCancel, onSubmit, className, ...props }) {
  return (
    <TextInputModal
      onSubmit={(p) => onSubmit(p.trim())}
      onChange={(p) => p.trimStart()}
      onCancel={onCancel}
      className={className}
      title={<StyledModalTitle><StyledIconContainer><FolderOutlineIcon /></StyledIconContainer>{t('newFolderModal.title')}</StyledModalTitle>}
      description={t('newFolderModal.description')}
      Icon={FolderIcon}
      submitText={t('app:actions.create')}
      {...props} />
  )
}

NewFolderModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

export default withTranslation('files')(NewFolderModal)

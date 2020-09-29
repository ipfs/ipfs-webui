import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import TrashIcon from '../../../icons/StrokeTrash'
import Button from '../../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'

const DeleteModal = ({ t, tReady, onCancel, onDelete, folders, files, className, ...props }) => {
  let context = 'File'
  const count = files + folders

  if (folders > 0) {
    if (files > 0) {
      context = 'Item'
    } else {
      context = 'Folder'
    }
  }

  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={t(`deleteModal.title${context}`, { count })} icon={TrashIcon}>
        <p className='gray w-80 center'>
          {t(`deleteModal.description${context}`, { count })}
        </p>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-red' onClick={onDelete}>{t('app:actions.delete')}</Button>
      </ModalActions>
    </Modal>
  )
}

DeleteModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  files: PropTypes.number,
  folders: PropTypes.number,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

DeleteModal.defaultProps = {
  className: '',
  files: 0,
  folders: 0
}

export default withTranslation('files')(DeleteModal)

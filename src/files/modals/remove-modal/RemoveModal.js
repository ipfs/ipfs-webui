import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import TrashIcon from '../../../icons/StrokeTrash'
import Button from '../../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'

const RemoveModal = ({ t, tReady, onCancel, onRemove, folders, files, className, ...props }) => {
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
      <ModalBody title={t(`removeModal.title${context}`, { count })} icon={TrashIcon}>
        <div className='charcoal w-90 center tl'>
          <p>{t(`removeModal.description${context}`, { count })}</p>
          <div>
            <input type="checkbox" class="mr1" id="removeLocalPin" name="removeLocalPin" />
            <label for="removeLocalPin">{t('removeModal.checkboxRemoveLocalPin')}</label>
          </div>
          <div className='mt1'>
            <input type="checkbox" class="mr1" id="unpinFromServices" name="unpinFromServices" />
            <label for="unpinFromServices">{t('removeModal.checkboxUnpinFromServices')}</label>
          </div>
        </div>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-red' onClick={onRemove}>{t('app:actions.remove')}</Button>
      </ModalActions>
    </Modal>
  )
}

RemoveModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  files: PropTypes.number,
  folders: PropTypes.number,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

RemoveModal.defaultProps = {
  className: '',
  files: 0,
  folders: 0
}

export default withTranslation('files')(RemoveModal)

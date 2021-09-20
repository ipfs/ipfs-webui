import React from 'react'
import PropTypes from 'prop-types'
import TrashIcon from '../../../icons/StrokeTrash'
import Button from '../../../components/button/Button'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal'

const RemoveKeyModal = ({ t, tReady, name, onCancel, onRemove, className, ...props }) => {
  return (
    <Modal {...props} className={className} onCancel={onCancel} >
      <ModalBody title={t('removeKeyModal.title')} Icon={TrashIcon}>
        <div className='charcoal w-100 center tl'>
          {t('removeKeyModal.description')}
        </div>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onCancel}>{t('app:actions.cancel')}</Button>
        <Button className='ma2 tc' bg='bg-red' onClick={onRemove}>{t('app:actions.remove')}</Button>
      </ModalActions>
    </Modal>
  )
}

RemoveKeyModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
}

RemoveKeyModal.defaultProps = {
  className: ''
}

export default RemoveKeyModal

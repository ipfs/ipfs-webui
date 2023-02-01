import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal.js'
import Button from '../../button/Button.js'

const AutoUploadModal = ({ name, service, t, onLeave, doSetAutoUploadForService, className, ...props }) => {
  const onToggle = () => {
    doSetAutoUploadForService(name)
    onLeave()
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <ModalBody>
        <p>{ t('autoUploadModal.title', { name }) }</p>
        <div className='pa2 AutoUploadModalContainer'>{t('autoUploadModal.description')}</div>
      </ModalBody>

      <ModalActions justify="center">
        <Button className='ma2 tc' bg='bg-teal' onClick={onToggle}>{service.autoUpload ? t('actions.disable') : t('actions.enable') }</Button>
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('actions.cancel')}</Button>
      </ModalActions>
    </Modal>
  )
}

AutoUploadModal.propTypes = {
  t: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired
}

AutoUploadModal.defaultProps = {
  className: ''
}

export default connect(
  'doSetAutoUploadForService',
  withTranslation('settings')(AutoUploadModal)
)

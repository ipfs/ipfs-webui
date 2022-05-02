import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
// import RetroButton from '../../common/atoms/RetroButton'
import RetroText from '../../common/atoms/RetroText'
import BlueBorderButton from '../../common/atoms/BlueBorderButton'
import FullGradientButton from '../../common/atoms/FullGradientButton'

const AutoUploadModal = ({ name, service, t, onLeave, doSetAutoUploadForService, className, ...props }) => {
  const onToggle = () => {
    doSetAutoUploadForService(name)
    onLeave()
  }

  return (
    <Modal {...props} className={className + ' generic-modal spacegrotesk'} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <ModalBody className='textinputmodal-body white spacegrotesk tc gray pb2' title={t('autoUploadModal.title', { name })}>
        <div className='pa2 AutoUploadModalContainer spacegrotesk '>{t('autoUploadModal.description')}</div>
      </ModalBody>

      <ModalActions justify="around">
        <BlueBorderButton width='130px' className='ma2 tc' bg='bg-gray' onClick={onLeave}>
          <RetroText className='white spacegrotesk'>
            {t('actions.cancel')}
          </RetroText>
        </BlueBorderButton>
        <FullGradientButton width='130px' className='ma2 tc' bg='bg-teal' onClick={onToggle}>
          <RetroText className='white spacegrotesk'>
            {service.autoUpload ? t('actions.disable') : t('actions.enable')}
          </RetroText>
        </FullGradientButton>
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

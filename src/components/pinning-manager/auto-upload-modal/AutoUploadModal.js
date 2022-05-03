import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation } from 'react-i18next'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import RetroButton from '../../common/atoms/RetroButton'
import RetroText from '../../common/atoms/RetroText'

const AutoUploadModal = ({ name, service, t, onLeave, doSetAutoUploadForService, className, ...props }) => {
  const onToggle = () => {
    doSetAutoUploadForService(name)
    onLeave()
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <ModalBody title={t('autoUploadModal.title', { name })}>
        <div className='pa2 AutoUploadModalContainer w95fa'>{t('autoUploadModal.description')}</div>
      </ModalBody>

      <ModalActions justify="around">
        <RetroButton width='100px' className='ma2 tc' bg='bg-teal' onClick={onToggle}>
          <RetroText>
            {service.autoUpload ? t('actions.disable') : t('actions.enable')}
          </RetroText>
        </RetroButton>
        <RetroButton width='100px' className='ma2 tc' bg='bg-gray' onClick={onLeave}>
          <RetroText>
            {t('actions.cancel')}
          </RetroText>
        </RetroButton>
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

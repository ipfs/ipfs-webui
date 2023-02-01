import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import PinningServiceModal from '../pinning-manager-service-modal/PinningManagerServiceModal.js'
import './PinningManagerModal.css'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal.js'
import Button from '../../button/Button.js'
import Overlay from '../../overlay/Overlay.js'

const PinningManagerModal = ({ t, tReady, onLeave, className, remoteServiceTemplates, pinningServicesDefaults, ...props }) => {
  const [selectedService, setSelectedService] = useState(false)

  const onCustomModalOpen = () => setSelectedService({ type: 'CUSTOM' })
  const onModalClose = () => setSelectedService(false)
  const onSuccess = () => {
    setSelectedService(false)
    onLeave()
  }

  const selectedServiceInfo = pinningServicesDefaults[selectedService.name] || {}

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <ModalBody>
        <p>{ t('pinningModal.title') }</p>
        <div className='pa2 pinningManagerModalContainer'>
          { remoteServiceTemplates.map(({ icon, name }) => (
            <button className="flex items-center pinningManagerModalItem pa1 hoverable-button" key={name} onClick={() => setSelectedService({ name, icon })}>
              <img className="mr3" src={icon} alt={name} width={42} height={42} style={{ objectFit: 'contain' }} />
              <p>{ name }</p>
            </button>
          ))}
        </div>
        <p className='flex items-center justify-center'>
          <Trans i18nKey="pinningModal.description" t={t}>
          Don’t see your pinning service provider? <Button className='pv0' type='link' onClick={onCustomModalOpen}>Add a custom one.</Button>
          </Trans>
        </p>
      </ModalBody>

      <ModalActions justify="center">
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('actions.cancel')}</Button>
      </ModalActions>

      <Overlay show={!!selectedService} onLeave={onModalClose} hidden>
        <PinningServiceModal className='outline-0' service={selectedService} onSuccess={onSuccess} onLeave={onModalClose} nickname={selectedServiceInfo.nickname} apiEndpoint={selectedServiceInfo.apiEndpoint} visitServiceUrl={selectedServiceInfo.visitServiceUrl} complianceReportUrl={selectedServiceInfo.complianceReportUrl} t={t} />
      </Overlay>
    </Modal>
  )
}

PinningManagerModal.propTypes = {
  t: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired
}

PinningManagerModal.defaultProps = {
  className: ''
}

export default connect(
  'selectRemoteServiceTemplates',
  'selectPinningServicesDefaults',
  withTranslation('settings')(PinningManagerModal)
)

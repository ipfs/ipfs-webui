import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import PinningServiceModal from '../pinning-manager-service-modal/PinningManagerServiceModal'
import './PinningManagerModal.css'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
// import Button from '../../button/Button'
import Overlay from '../../overlay/Overlay'

// import RetroButton from '../../common/atoms/RetroButton'
import RetroText from '../../common/atoms/RetroText'
import RetroGradientButton from '../../common/atoms/RetroGradientButton'
import FullGradientButton from '../../common/atoms/FullGradientButton'

const PinningManagerModal = ({ t, tReady, onLeave, className, remoteServiceTemplates, pinningServicesDefaults, ...props }) => {
  const [selectedService, setSelectedService] = useState(false)

  const onCustomModalOpen = () => setSelectedService({ type: 'CUSTOM' })

  const onModalClose = () => {
    const modalNode = document.getElementById('pinningServiceModal')
    if (modalNode) {
      modalNode.classList.add('translateY')
    }
    setTimeout(() => {
      setSelectedService(false)
    }, 500)
  }

  const onSuccess = () => {
    setSelectedService(false)
    onLeave()
  }

  const selectedServiceInfo = pinningServicesDefaults[selectedService.name] || {}

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '24em' }}>
      <ModalBody className={'textinputmodal-body white tc spacegrotesk'} title={<span className='white fs24 spacegrotesk-bold'>{t('pinningModal.title')}</span>}>
        <div className='pa2 pinningManagerModalContainer'>
          {remoteServiceTemplates.map(({ icon, name }) => (
            <RetroGradientButton flat width='220px' height='80px' borderRadius='10px' className="flex items-center pinningManagerModalItem pa1 mv1" key={name} onClick={() => setSelectedService({ name, icon })}>
              <img src={icon} alt={name} width={42} height={42} style={{ objectFit: 'contain' }} />
              <RetroText className='white spacegrotesk' style={{ margin: '0px 10px' }} fontSize={24}>{name}</RetroText>
            </RetroGradientButton>
          ))}
        </div>
        <p className='flex items-center justify-center spacegrotesk f6 ma0 mt3 mb3'>
          <Trans i18nKey="pinningModal.description" t={t}>
            Don’t see your pinning service provider?
            {/* <Button style={{ width: 'fit-content', minWidth: '0' }} className='pv0 pl1 pr0 spacegrotesk purple f6' type='link' onClick={onCustomModalOpen}>Add a custom one.</Button> */}
          </Trans>
        </p>
      </ModalBody>

      <ModalActions justify="center" className={'mt4'}>
        <RetroGradientButton width='100px' height='38px' className='tc' bg='bg-gray' onClick={onLeave}>
          <RetroText className='white spacegrotesk-medium'>
            {t('actions.cancel')}
          </RetroText>
        </RetroGradientButton>

        <FullGradientButton width='200px' height='38px' className='ml3 tc' bg='bg-gray' onClick={onCustomModalOpen}>
          <RetroText className='white spacegrotesk-medium'>
            Add a custom one
          </RetroText>
        </FullGradientButton>
      </ModalActions>

      <Overlay show={!!selectedService} onLeave={onModalClose} hidden>
        <PinningServiceModal id="pinningServiceModal" className='outline-0' service={selectedService} onSuccess={onSuccess} onLeave={onModalClose} nickname={selectedServiceInfo.nickname} apiEndpoint={selectedServiceInfo.apiEndpoint} visitServiceUrl={selectedServiceInfo.visitServiceUrl} t={t} />
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

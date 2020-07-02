import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'
import './PinningManagerModal.css'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import Button from '../../button/Button'

const PinningManagerModal = ({ t, onLeave, className, availablePinningServices, ...props }) => {
  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <ModalBody>
        <p>{ t('pinningModal.title') }</p>
        <div className='pa2 pinningManagerModalContainer'>
          { availablePinningServices.map(({ icon, name }) => (
            <button className="flex items-center pinningManagerModalItem pa1 hoverable-button">
              <img className="mr3" src={icon} alt={name} width={42} height={42} style={{ objectFit: 'contain' }} />
              <p>{ name }</p>
            </button>
          ))}
        </div>
        <p>
          <Trans i18nKey="pinningModal.description" t={t}>
          Don’t see your pinning service provider? <a href={/* TODO: add action for custom add */ '/'}>Add a custom one.</a>
          </Trans>
        </p>
      </ModalBody>

      <ModalActions justify="center">
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('actions.cancel')}</Button>
      </ModalActions>
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
  'selectAvailablePinningServices',
  withTranslation('settings')(PinningManagerModal)
)

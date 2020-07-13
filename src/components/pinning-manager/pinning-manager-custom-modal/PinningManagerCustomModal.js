import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redux-bundler-react'
import { withTranslation, Trans } from 'react-i18next'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import Button from '../../button/Button'

const PinningManagerCustomModal = ({ t, onLeave, className, ...props }) => {
  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '34em' }}>
      <ModalBody>
        <p>{ t('pinningCustomModal.title') }</p>
        <div className='pa2 pinningManagerCustomModalContainer'>
          { t('pinningCustomModal.nickname') }
        </div>
        <Trans i18nKey="pinningCustomModal.description" t={t}>
          Want to make your custom pinning service available to others?
          <a href={'/' /* TODO: add link */} className='pv0' type='link'>Learn how.</a>
        </Trans>
      </ModalBody>

      <ModalActions justify="center">
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('actions.cancel')}</Button>
      </ModalActions>
    </Modal>
  )
}

PinningManagerCustomModal.propTypes = {
  t: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired
}

PinningManagerCustomModal.defaultProps = {
  className: ''
}

export default connect(
  // 'selectAvailablePinningServices',
  withTranslation('settings')(PinningManagerCustomModal)
)

import React from 'react'
import PropTypes from 'prop-types'
import ShareIcon from '../../../icons/StrokeShare.js'
import Button from '../../../components/button/Button.js'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/Modal.js'

const ShareModal = ({ t, tReady, onLeave, link, className, ...props }) => (
  <Modal {...props} className={className} onCancel={onLeave} >
    <ModalBody title={t('shareModal.title')} Icon={ShareIcon}>
      <p className='charcoal w-90 tl center'>{t('shareModal.description')}</p>

      <div className='flex center w-90 pb2'>
        <input
          value={link}
          readOnly
          className={'input-reset flex-grow-1 charcoal-muted ba b--black-20 br1 pa2 mr2 focus-outline'}
          type='text' />
      </div>
    </ModalBody>

    <ModalActions>
      <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('app:actions.close')}</Button>
      <CopyToClipboard text={link} onCopy={onLeave}>
        <Button className='ma2 tc'>{t('app:actions.copy')}</Button>
      </CopyToClipboard>
    </ModalActions>
  </Modal>
)

ShareModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  link: PropTypes.string,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

ShareModal.defaultProps = {
  className: ''
}

export default withTranslation('files')(ShareModal)

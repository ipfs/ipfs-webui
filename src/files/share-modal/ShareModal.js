import React from 'react'
import PropTypes from 'prop-types'
import ShareIcon from '../../icons/StrokeShare'
import Button from '../../components/button/Button'
import { translate } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Modal, ModalActions, ModalBody } from '../../components/modal/Modal'

const ShareModal = ({ t, tReady, onLeave, link, className, ...props }) => (
  <Modal {...props} className={className} onCancel={onLeave} >
    <ModalBody title={t('shareModal.title')} icon={ShareIcon}>
      <p className='gray w-80 center'>{t('shareModal.description')}</p>

      <div className='flex center w-100 pa2'>
        <input
          value={link}
          readOnly
          autoFocus
          className={`input-reset flex-grow-1 charcoal-muted ba b--black-20 br1 pa2 mr2 focus-outline`}
          type='text' />
      </div>
    </ModalBody>

    <ModalActions>
      <Button className='ma2' bg='bg-gray' onClick={onLeave}>{t('actions.close')}</Button>
      <CopyToClipboard text={link} onCopy={onLeave}>
        <Button className='ma2'>{t('actions.copy')}</Button>
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

export default translate('files')(ShareModal)

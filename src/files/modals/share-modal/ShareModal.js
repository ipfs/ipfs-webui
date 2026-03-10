import React, { useState } from 'react'
import PropTypes from 'prop-types'
import QRCode from 'react-qr-code'
import Button from '../../../components/button/button.tsx'
import Checkbox from '../../../components/checkbox/Checkbox.js'
import { withTranslation } from 'react-i18next'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Modal, ModalActions, ModalBody } from '../../../components/modal/modal'

const ShareModal = ({ t, tReady, onLeave, link, localLink, subdomainLocalLink, className, ...props }) => {
  const [useLocalLink, setUseLocalLink] = useState(false)
  const [useSubdomains, setUseSubdomains] = useState(false)

  let activeLink = link
  if (useLocalLink && localLink) {
    activeLink = useSubdomains && subdomainLocalLink ? subdomainLocalLink : localLink
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} >
      <ModalBody title={t('shareModal.title')}>
        <p className='charcoal w-90 center'>
          {useLocalLink ? t('shareModal.descriptionLocal') : t('shareModal.description')}
        </p>
        {!useLocalLink && (
          <div className='flex justify-center pb3'>
            <QRCode
              size={180}
              value={activeLink}
            />
          </div>
        )}
        <div className='flex center w-90 pb2'>
          <input
            value={activeLink}
            readOnly
            className={'input-reset flex-grow-1 charcoal-muted ba b--black-20 br1 pa2 mr2 focus-outline'}
            type='text' />
        </div>
        {localLink && (
          <div className='flex center w-90 pb2'>
            <Checkbox
              checked={useLocalLink}
              onChange={setUseLocalLink}
              label={t('shareModal.useLocalLink')}
            />
          </div>
        )}
        {useLocalLink && subdomainLocalLink && (
          <div className='flex center w-90 pb2 ml3'>
            <Checkbox
              checked={useSubdomains}
              onChange={setUseSubdomains}
              label={t('shareModal.useSubdomains')}
            />
          </div>
        )}
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('app:actions.close')}</Button>
        <CopyToClipboard text={activeLink} onCopy={onLeave}>
          <Button className='ma2 tc'>{t('app:actions.copy')}</Button>
        </CopyToClipboard>
      </ModalActions>
    </Modal>
  )
}

ShareModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  link: PropTypes.string,
  localLink: PropTypes.string,
  subdomainLocalLink: PropTypes.string,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

ShareModal.defaultProps = {
  className: '',
  localLink: '',
  subdomainLocalLink: ''
}

export default withTranslation('files')(ShareModal)

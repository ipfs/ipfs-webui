import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import i18n, { localesList } from '../../../i18n'
import { getLanguage } from '../../../lib/i18n'

// Components
import { Modal, ModalBody, ModalActions } from '../../modal/Modal'
import SpeakerIcon from '../../../icons/StrokeSpeaker'
import Button from '../../button/Button'

const LanguageModal = ({ t, tReady, onLeave, link, className, ...props }) => {
  const handleClick = (lang) => {
    i18n.changeLanguage(lang)
    onLeave()
  }

  return (
    <Modal {...props} className={className} onCancel={onLeave} style={{ maxWidth: '40em' }}>
      <ModalBody icon={SpeakerIcon}>
        <p className='gray w-80 center'>{t('languageModal.description')}</p>
        <div className='pa2 flex flex-wrap'>
          { localesList.map((lang) =>
            <button
              key={`lang-${lang}`}
              className='pa2 w-33 flex nowrap bg-transparent bn outline-0 aqua pointer'
              onClick={() => handleClick(lang)}>
              { getLanguage(lang) }
            </button>
          )}
        </div>
      </ModalBody>

      <ModalActions>
        <Button className='ma2' bg='bg-gray' onClick={onLeave}>{t('actions.close')}</Button>
      </ModalActions>
    </Modal>
  )
}

LanguageModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired
}

LanguageModal.defaultProps = {
  className: ''
}

export default translate('settings')(LanguageModal)

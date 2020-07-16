import React from 'react'
import PropTypes from 'prop-types'
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
        <p className='charcoal w-80 center'>{t('languageModal.description')}</p>
        <div className='pa2 flex flex-wrap'>
          { localesList.map((lang) =>
            <button
              key={`lang-${lang}`}
              className='pa2 w-33 flex nowrap bg-transparent bn outline-0 blue justify-center'
              onClick={() => handleClick(lang)}>
              { getLanguage(lang) }
            </button>
          )}
        </div>
        <p className='lh-copy charcoal f6'>
          {t('languageModal.translationProjectIntro')}<br/>
          <a href="https://www.transifex.com/ipfs/public/" rel="noopener noreferrer" target="_blank" className="link blue">{t('languageModal.translationProjectLink')}</a>
        </p>
      </ModalBody>

      <ModalActions>
        <Button className='ma2 tc' bg='bg-gray' onClick={onLeave}>{t('actions.close')}</Button>
      </ModalActions>
    </Modal>
  )
}

LanguageModal.propTypes = {
  onLeave: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool
}

LanguageModal.defaultProps = {
  className: ''
}

export default LanguageModal
